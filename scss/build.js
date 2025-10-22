import { ensureDir } from '@std/fs';
import { compile } from 'sass';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_C = '\x1b[36m';
const CLR_Y = '\x1b[33m';

const OUT_DIR = 'dist/';

const FILES = ['general', 'search', 'style', 'theme-list'];

const THEME_DIR = 'catppuccin/';
const THEME_FILES = ['au-lait', 'frappe', 'latte', 'macchiato', 'mocha'];

const compileScss = async (input, output) => {
  const result = compile(input, { style: 'compressed' });
  await Deno.writeTextFile(output, result.css);
  const size = new TextEncoder().encode(result.css).length;
  const fileName = input.padEnd(32, ' ');
  console.info(`[INFO]: ${CLR_BC}sass${CLR_RESET} ${CLR_C}${fileName}${CLR_RESET} 🎁 ${size} bytes`);
};

(async () => {
  console.info(`[INFO]: 🎅 I'll use ${CLR_BC}sass${CLR_RESET} to create ${CLR_BG}css${CLR_RESET}!`);
  const start = performance.now();

  await ensureDir(OUT_DIR);
  await ensureDir(`${OUT_DIR}${THEME_DIR}`);

  await Promise.all(FILES.map(file => compileScss(`${file}.scss`, `${OUT_DIR}${file}.css`)));

  await Promise.all(
    THEME_FILES.map(file => compileScss(`${THEME_DIR}${file}.scss`, `${OUT_DIR}${THEME_DIR}${file}.css`)),
  );

  const time = Math.floor(performance.now() - start);
  console.info(`    ${CLR_BG}Finished${CLR_RESET} release target(s) in ${time}ms 🧒${CLR_Y}Happy!!${CLR_RESET}`);
})();
