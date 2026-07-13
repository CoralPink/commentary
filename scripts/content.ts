import * as g from './global.ts';

import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import diff from 'highlight.js/lib/languages/diff';
import json from 'highlight.js/lib/languages/json';
import lua from 'highlight.js/lib/languages/lua';
import vim from 'highlight.js/lib/languages/vim';

import { JSDOM } from 'jsdom';
import { join } from 'path';
import pLimit from 'p-limit';

const LANGUAGE_PREFIX = 'language-';

// Unicode Private Use Area range used by Nerd Fonts
// - U+E000〜U+F8FF (BMP PUA)
// - U+F0000〜U+FFFFD (Supplementary PUA-A)
const NERD_FONT_UNICODE_RANGE = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}]/u;
const containsNerdFontIcon = (text: string): boolean => NERD_FONT_UNICODE_RANGE.test(text);

const LIMIT_CONCURRENT = 8;
const limit = pLimit(LIMIT_CONCURRENT);

const tasks: Promise<void>[] = [];

const createCopyButton = (document: Document): HTMLButtonElement => {
  const button = document.createElement('button');

  button.className = 'copy-button';
  button.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.className = 'icon-copy fa-icon';

  button.append(icon);

  return button;
};

const highlighting = (code: HTMLPreElement): string | null => {
  const langClass = [...code.classList].find(x => x.startsWith(LANGUAGE_PREFIX));

  if (langClass === undefined) {
    return null;
  }

  const lang = langClass.slice('language-'.length);

  try {
    return hljs.highlight(code.textContent, {
      language: lang,
    }).value;
  } catch {
    return null;
  }
};

const rewriteHighlight = (document: Document): boolean => {
  let modified = false;

  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('diff', diff);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('lua', lua);
  hljs.registerLanguage('vim', vim);

  const clipButton = createCopyButton(document);

  for (const code of document.querySelectorAll<HTMLPreElement>('pre code:not(.language-txt)')) {
    const highlightedCode = highlighting(code);

    if (highlightedCode === null) {
      continue;
    }

    if (containsNerdFontIcon(code.textContent)) {
      code.classList.add('needs-nerd-font');
    }
    code.setAttribute('translate', 'no');
    code.innerHTML = highlightedCode;

    modified = true;

    if (code.parentElement === null) {
      continue;
    }
    code.parentElement.prepend(clipButton.cloneNode(true));
  }

  return modified;
};

const isEndsWithHtml = (s: string): boolean => s.endsWith('.html');

const isExternalLink = (elm: HTMLAnchorElement): boolean => {
  const rawHref = elm.getAttribute('href');

  if (!rawHref) {
    return false;
  }

  try {
    const url = new URL(rawHref, g.rootPath);

    return url.origin !== new URL(g.rootPath).origin;
  } catch {
    return false;
  }
};

const rewriteLinks = (document: Document): boolean => {
  let modified = false;

  for (const elm of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (!isExternalLink(elm)) {
      continue;
    }

    elm.setAttribute('target', '_blank');
    elm.setAttribute('rel', 'noopener');

    modified = true;
  }

  return modified;
};

const rewriteVideos = (document: Document): boolean => {
  let modified = false;

  for (const video of document.querySelectorAll<HTMLVideoElement>('video')) {
    const parent = video.parentNode;

    if (!parent) {
      continue;
    }

    // Set `preload=“none”` for all items at once.
    video.setAttribute('preload', 'none');

    // Build a format compliant with video.js v10
    const player = document.createElement('video-player');
    const skin = document.createElement('video-minimal-skin');

    parent.insertBefore(player, video);

    player.appendChild(skin);
    skin.appendChild(video);

    modified = true;
  }

  return modified;
};

const fileProc = (fullPath: string): string | null => {
  const dom = new JSDOM(Deno.readTextFileSync(fullPath));

  const highlightModified = rewriteHighlight(dom.window.document);
  const linksModified = rewriteLinks(dom.window.document);
  const videosModified = rewriteVideos(dom.window.document);

  // Return null if there are no changes
  return highlightModified || linksModified || videosModified ? dom.serialize() : null;
};

const processDir = async (currentDir: string): Promise<void> => {
  for await (const entry of Deno.readDir(currentDir)) {
    const fullPath = join(currentDir, entry.name);

    if (entry.isDirectory) {
      tasks.push(processDir(fullPath));
      continue;
    }

    if (!entry.isFile) {
      continue;
    }
    if (!isEndsWithHtml(entry.name) || entry.name === g.HTML_TOC) {
      continue;
    }

    tasks.push(
      limit(async () => {
        const serialized = fileProc(fullPath);

        if (serialized === null) {
          return;
        }
        await Deno.writeTextFile(fullPath, serialized);
      }),
    );
  }
};

(async () => {
  const start = performance.now();

  await processDir(g.PATH_DIRECTORY);
  await Promise.all(tasks);

  const time = Math.floor(performance.now() - start);

  console.info(`${g.CLR_BG}✔ ${g.CLR_BC}content${g.CLR_RESET} Finished in ${g.CLR_BG}${time} ms${g.CLR_RESET}`);
  console.info(`${g.CLR_G}INFO${g.CLR_RESET} mode: ${g.isDebug ? 'debug' : 'production'}`);
  console.info(`${g.CLR_G}INFO${g.CLR_RESET} rootPath: ${g.rootPath}`);
})();
