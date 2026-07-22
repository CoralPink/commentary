import { ensureDir } from '@std/fs';

import browserslist from 'browserslist';
import { browserslistToTargets, transform, type TransformResult } from 'lightningcss';
import { compile } from 'sass';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_C = '\x1b[36m';

const OUT_DIR = 'dist/';

// biome-ignore format: keep SCSS filelist readable
const SCSS_FILE_LIST = [
  "footnote",
  "footnote-legacy",
  "general",
  "search",
  "style",
  "theme-list",
];

const THEME_DIR = 'catppuccin/';
const THEME_FILES = ['au-lait', 'frappe', 'latte', 'macchiato', 'mocha'];

// biome-ignore format: keep browserslist readable
const TARGET_VERSION = [
  "last 3 chrome version",
  "last 3 firefox version",
  "last 3 safari version",
].join(", ");

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const compileScss = (input: string): Uint8Array<ArrayBuffer> => {
  const result = compile(input, { style: 'expanded' });

  return encoder.encode(result.css);
};

const optimize = (filename: string, code: Uint8Array): TransformResult =>
  transform({
    filename,
    code,
    minify: true,
    targets: browserslistToTargets(browserslist(TARGET_VERSION)),
  });

const build = async (input: string, output: string): Promise<void> => {
  const css = compileScss(input);
  const optimized = optimize(input, css);

  await Deno.writeTextFile(`${OUT_DIR}${output}`, decoder.decode(optimized.code));

  const fileName = output.padEnd(32, ' ');
  console.info(`[INFO]: ${CLR_BC}sass ${CLR_C}${fileName}${CLR_RESET} 🎁 ${optimized.code.length} bytes`);
};

(async (): Promise<void> => {
  const start = performance.now();

  await Promise.all([ensureDir(OUT_DIR), ensureDir(`${OUT_DIR}${THEME_DIR}`)]);

  const list = [
    { dir: '', files: SCSS_FILE_LIST },
    { dir: THEME_DIR, files: THEME_FILES },
  ];

  await Promise.all(list.flatMap(x => x.files.map(file => build(`${x.dir}${file}.scss`, `${x.dir}${file}.css`))));

  const time = Math.floor(performance.now() - start);
  console.info(`${CLR_BG}√ ${CLR_BC}sass${CLR_RESET} Finished in ${CLR_BG}${time} ms${CLR_RESET}\n`);
})();
