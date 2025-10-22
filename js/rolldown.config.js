import denoPlugin from '@deno/rolldown-plugin';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rolldown';

const OUT_DIR = './dist';

const makeConfig = input => ({
  input,
  output: { dir: OUT_DIR },
  plugins: [
    denoPlugin(),
    terser({
      maxWorkers: 4,
    }),
  ],
});

export default defineConfig([
  makeConfig('./book.ts'),
  makeConfig('./hl-worker.ts'),
  makeConfig('./hl-sharedworker.ts'),
  makeConfig('./replace-dom.ts'),
  makeConfig('./serviceworker.ts'),
  makeConfig('./slider.ts'),
]);
