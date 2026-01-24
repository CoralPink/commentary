import * as g from './global.ts';

import { join } from 'path';
import { JSDOM } from 'jsdom';

const LinkKind = {
  External: 'external',
  Native: 'native',
  Internal: 'internal',
  Undefined: 'undefined',
} as const;

type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

const isHttpProtocol = (s: URL): boolean => s.protocol === 'http:' || s.protocol === 'https:';
const isEndsWithHtml = (s: string): boolean => s.endsWith('.html');

const getLinkKind = (elm: HTMLAnchorElement): LinkKind => {
  const rawHref = elm.getAttribute('href');

  if (!rawHref) {
    return LinkKind.Undefined;
  }
  if (rawHref.startsWith('#')) {
    return LinkKind.Native;
  }
  if (rawHref.startsWith('.') || rawHref.startsWith('/')) {
    return LinkKind.Internal;
  }

  try {
    const url = new URL(rawHref);
    return isHttpProtocol(url) ? LinkKind.External : LinkKind.Native;
  } catch {
    return LinkKind.Undefined;
  }
};

const isExternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.External;

const externalLinkProc = (elm: HTMLAnchorElement): void => {
  elm.setAttribute('target', '_blank');
  elm.setAttribute('rel', 'noopener');
};

const processDir = async (currentDir: string): Promise<void> => {
  for await (const entry of Deno.readDir(currentDir)) {
    const fullPath = join(currentDir, entry.name);

    if (entry.isFile) {
      if (!isEndsWithHtml(entry.name) || entry.name === g.HTML_TOC) {
        continue;
      }

      const html = await Deno.readTextFile(fullPath);
      const dom = new JSDOM(html);

      let modified = false;

      for (const elm of dom.window.document.querySelectorAll('a[href]')) {
        if (isExternalLink(elm as HTMLAnchorElement)) {
          externalLinkProc(elm as HTMLAnchorElement);
          modified = true;
        }
      }

      if (modified) {
        await Deno.writeTextFile(fullPath, dom.serialize());
      }
      continue;
    }

    if (entry.isDirectory) {
      await processDir(fullPath);
    }
  }
};

(async () => {
  const start = performance.now();

  await processDir(g.PATH_DIRECTORY);

  const time = Math.floor(performance.now() - start) / 1000;

  console.info(`${g.CLR_BG}✔ ${g.CLR_BC}link${g.CLR_RESET} Finished in ${g.CLR_BG}${time} s${g.CLR_RESET}`);
  console.info(` ${g.CLR_G}INFO${g.CLR_RESET} Build mode: ${g.isDebug ? 'debug' : 'production'}`);
  console.info(` ${g.CLR_G}INFO${g.CLR_RESET} rootPath = ${g.rootPath}\n`);
})();
