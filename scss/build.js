import { ensureDir } from '@std/fs';

import browserslist from 'browserslist';
import { browserslistToTargets, transform } from 'lightningcss';
import { compile } from 'sass';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_C = '\x1b[36m';

const OUT_DIR = 'dist/';

const FILES = ['general', 'search', 'style', 'theme-list'];

const THEME_DIR = 'catppuccin/';
const THEME_FILES = ['au-lait', 'frappe', 'latte', 'macchiato', 'mocha'];

const TARGET_VERSION = 'last 3 chrome version, last 3 firefox version, last 3 safari version';

const scss_to_css = input => {
  const result = compile(input, { style: 'expanded' });

  return new TextEncoder().encode(result.css);
};

const optimize = (filename, code) =>
  transform({
    filename,
    code,
    minify: true,
    targets: browserslistToTargets(browserslist(TARGET_VERSION)),
  });

const build = async(input, output) => {
  // SCSS → CSS
  const css = scss_to_css(input);

  // CSS → optimized CSS
  const optimized = optimize(input, css);

  await Deno.writeTextFile(`${OUT_DIR}${output}`, new TextDecoder().decode(optimized.code));

  const fileName = output.padEnd(32, ' ');
  const size = new TextEncoder().encode(optimized.code).length;

  console.info(`[INFO]: ${CLR_BC}sass ${CLR_C}${fileName}${CLR_RESET} 🎁 ${size} bytes`);
};

(async () => {
  const start = performance.now();

  await Promise.all([ensureDir(OUT_DIR), ensureDir(`${OUT_DIR}${THEME_DIR}`)]);

  const list = [
    { dir: '', files: FILES },
    { dir: THEME_DIR, files: THEME_FILES },
  ];

  await Promise.all(list.flatMap(x => x.files.map(file => build(`${x.dir}${file}.scss`, `${x.dir}${file}.css`))));

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`${CLR_BG}✔ ${CLR_BC}sass${CLR_RESET} Finished in ${CLR_BG}${time} s${CLR_RESET}\n`);
})();
