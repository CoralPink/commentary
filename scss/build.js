import { ensureDir } from '@std/fs';
import { compile } from 'sass';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_C = '\x1b[36m';

const OUT_DIR = 'dist/';

const FILES = ['general', 'search', 'style', 'theme-list'];

const THEME_DIR = 'catppuccin/';
const THEME_FILES = ['au-lait', 'frappe', 'latte', 'macchiato', 'mocha'];

const build = async (input, output) => {
  const result = compile(input, { style: 'compressed' });

  await Deno.writeTextFile(output, result.css);

  const size = new TextEncoder().encode(result.css).length;
  const fileName = input.padEnd(32, ' ');

  console.info(`[INFO]: ${CLR_BC}sass ${CLR_C}${fileName}${CLR_RESET} 🎁 ${size} bytes`);
};

(async () => {
  const start = performance.now();

  await Promise.all([ensureDir(OUT_DIR), ensureDir(`${OUT_DIR}${THEME_DIR}`)]);

  const list = [
    { dir: '', files: FILES },
    { dir: THEME_DIR, files: THEME_FILES },
  ];

  await Promise.all(
    list.flatMap(group => group.files.map(file => build(`${group.dir}${file}.scss`, `dist/${group.dir}${file}.css`))),
  );

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`\n${CLR_BG}✔ ${CLR_BC}sass${CLR_RESET} Finished in ${CLR_BG}${time} s${CLR_RESET}`);
})();
