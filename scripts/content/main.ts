import { HighlightProc, LinkProc, VideoProc } from './mod.ts';

import * as g from '../global.ts';
import { compressHtml } from '../beautify.ts';

import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'path';
import pLimit from 'p-limit';

const LIMIT_CONCURRENT = 8;
const limit = pLimit(LIMIT_CONCURRENT);

const tasks: Promise<void>[] = [];

const isEndsWithHtml = (s: string): boolean => s.endsWith('.html');

const fileProc = (fullPath: string): string | null => {
  const dom = new JSDOM(readFileSync(fullPath));

  HighlightProc(dom.window.document);
  LinkProc(dom.window.document);
  VideoProc(dom.window.document);

  return compressHtml(dom.serialize());
};

const processDir = async (currentDir: string): Promise<void> => {
  for (const entry of await readdir(currentDir, { withFileTypes: true })) {
    const fullPath = join(currentDir, entry.name);

    if (entry.isDirectory()) {
      tasks.push(processDir(fullPath));
      continue;
    }

    if (!entry.isFile()) {
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
        await writeFile(fullPath, serialized);
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
