import * as sass from 'sass'

import { Buffer } from 'bun:buffer';
import fs, { writeFile } from 'bun:fs/promises';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_C = '\x1b[36m';
const CLR_Y = '\x1b[33m';

const OUT_DIR = 'dist/';

const FILES = [
  'chapter', 'general', 'search', 'style', 'theme-list',
];

const THEME_DIR = 'catppuccin/';
const THEME_FILES = [
  'au-lait', 'frappe', 'latte', 'macchiato', 'mocha'
];

const ensureDirectoryExists = async dir => {
  await fs.mkdir(dir, { recursive: true });
}

const compileScss = async (input, output) => {
  try {
    const result = sass.compile(input, {
      style: 'compressed',
      sourceMap: false,
      charset: false,
    });

    const fileName = input.padEnd(32, ' ');
    const cssSize = Buffer.byteLength(result.css, 'utf8');
    console.info(`[INFO]:   ${CLR_BC}sass${CLR_RESET} ${CLR_C}${fileName}${CLR_RESET}🎁 ${cssSize} byte`);

    await writeFile(output, result.css);

  } catch (err) {
    console.error(`compileError: ${err}`);
  }
}

(async () => {
  console.info(`[INFO]: 🎅 I'll use ${CLR_BC}sass${CLR_RESET} to create ${CLR_BG}css${CLR_RESET}!`);
  const start = performance.now();

  ensureDirectoryExists(OUT_DIR);

  for (const file of FILES) {
    await compileScss(`${file}.scss`, `${OUT_DIR}${file}.css`);
  }

  ensureDirectoryExists(OUT_DIR + THEME_DIR);

  for (const file of THEME_FILES) {
    await compileScss(`${THEME_DIR}${file}.scss`, `${OUT_DIR}${THEME_DIR}${file}.css`);
  }

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`    ${CLR_BG}Finished${CLR_RESET} release target(s) in ${time}s 🧒${CLR_Y}Happy!!${CLR_RESET}`);
})();
