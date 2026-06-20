import * as g from './global.ts';

import { JSDOM } from 'jsdom';
import { join } from 'path';
import pLimit from 'p-limit';

const LIMIT_CONCURRENT = 8;
const limit = pLimit(LIMIT_CONCURRENT);

const tasks: Promise<void>[] = [];

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

  const linksModified = rewriteLinks(dom.window.document);
  const videosModified = rewriteVideos(dom.window.document);

  // Return null if there are no changes
  return linksModified || videosModified ? dom.serialize() : null;
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
