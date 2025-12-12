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
      compress: {
        passes: 3,
        pure_getters: true,
        ecma: 2024,
        module: true,
        toplevel: true,
      },
      format: {
        comments: false,
      },
    }),
  ],
  checks: { pluginTimings: false },
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
  makeConfig('./navigation.ts'),
  makeConfig('./serviceworker.ts'),

  makeConfig('./extensions/codeblock.ts'),
  makeConfig('./extensions/footnote.ts'),
  makeConfig('./extensions/media.ts'),
//  makeConfig('./extensions/replace-dom.ts'),
  makeConfig('./extensions/slider.ts'),

  makeConfig('./webworker/hl-worker.ts'),
  makeConfig('./webworker/hl-sharedworker.ts'),
]);
