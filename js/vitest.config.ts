import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/link.test.ts'],// FIXME: Temporarily ignoring 'searcher.test.ts'...
  },
});
