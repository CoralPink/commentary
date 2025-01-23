import { minify } from 'terser';
import { writeFile, readFile } from 'bun:fs/promises';
import { Buffer } from 'bun:buffer';

import path from 'bun:path';

const ENTRY_POINTS = ['book.ts', 'hl-worker.ts', 'replace-dom.ts', 'serviceworker.js'];
const OUT_DIR = './dist';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_C = '\x1b[36m';
const CLR_Y = '\x1b[33m';

const bunBuild = async () =>
  Bun.build({
    entrypoints: ENTRY_POINTS,
    outdir: OUT_DIR,
    target: 'browser',
    format: 'esm',
    minify: true,
  });

const teaserCompress = async result => {
  const compressionOptions = {
    compress: true,
    mangle: true,
    output: { comments: false },
  };

  try {
    await Promise.all(
      result.outputs.map(async file => {
        const code = await readFile(file.path, 'utf8');

        const compressed = await minify(code, compressionOptions);

        const fileName = path.basename(file.path).padEnd(20, ' ');
        const bunByteLength = Buffer.byteLength(code, 'utf8');
        const terserByteLength = Buffer.byteLength(compressed.code, 'utf8');

        console.info(
          `[INFO]: ${CLR_BC}teaser${CLR_RESET} ${CLR_C}${fileName}${CLR_RESET}🍞 ${bunByteLength} -> 🥪 ${terserByteLength} bytes`,
        );

        await writeFile(file.path, compressed.code);
      }),
    );
  } catch (error) {
    console.error('Error during compression:', error);
    throw error;
  }
};

(async () => {
  console.info(`[INFO]: 👩 I'm going to bake ${CLR_BC}bun${CLR_RESET} now!`);
  const start = performance.now();

  const result = await bunBuild();

  if (!result.success) {
    throw new AggregateError(result.logs, 'Build Failed');
  }

  for (const message of result.logs) {
    console.log(message);
  }

  await teaserCompress(result);

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`    ${CLR_BG}Finished${CLR_RESET} release target(s) in ${time}s 😋${CLR_Y}Yummy!!${CLR_RESET}`);
})();
