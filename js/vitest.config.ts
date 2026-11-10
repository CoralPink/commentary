import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL('./', import.meta.url)),
      },
    ],
  },
  test: {
    alias: {
      './wasm_book.js': fileURLToPath(new URL('./test/mocks/wasm_book.ts', import.meta.url)),
    },
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    include: ['test/**/*.test.ts'],
  },
});
