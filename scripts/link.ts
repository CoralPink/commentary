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

const externalLinkProc = (elm: HTMLAnchorElement): void => {
  elm.setAttribute('target', '_blank');
  elm.setAttribute('rel', 'noopener');
};

const fileProc = async (fullPath: string): Promise<string | null> => {
  const html = await Deno.readTextFile(fullPath);
  const dom = new JSDOM(html);

  let modified = false;

  for (const elm of dom.window.document.querySelectorAll('a[href]')) {
    if (!isExternalLink(elm)) {
      continue;
    }

    externalLinkProc(elm);
    modified = true;
  }

  // Return null if there are no changes
  return modified ? dom.serialize() : null;
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
        const serialized = await fileProc(fullPath);

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

  const time = Math.floor(performance.now() - start) / 1000;

  console.info(`${g.CLR_BG}✔ ${g.CLR_BC}link${g.CLR_RESET} Finished in ${g.CLR_BG}${time} s${g.CLR_RESET}`);
  console.info(` ${g.CLR_G}INFO${g.CLR_RESET} Build mode: ${g.isDebug ? 'debug' : 'production'}`);
  console.info(` ${g.CLR_G}INFO${g.CLR_RESET} rootPath = ${g.rootPath}`);
})();
