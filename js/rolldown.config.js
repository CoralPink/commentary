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
  onLog: (level, log, _defaultHandler) => {
    console.log(log.message);

    // If you don't set it, the build seems to proceed without interruption even if warnings exist,
    // but I don't know the correct way to stop it...
    if (level === 'warn' || level === 'error') {
      throw new Error();
    }
  },
});

export default defineConfig([
  makeConfig('./book.ts'),
  makeConfig('./hl-worker.ts'),
  makeConfig('./hl-sharedworker.ts'),
  makeConfig('./replace-dom.ts'),
  makeConfig('./serviceworker.ts'),
  makeConfig('./slider.ts'),
]);
