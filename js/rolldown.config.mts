import { defineConfig, type LogLevel, type LogOrStringHandler, type RolldownOptions, type RollupLog } from 'rolldown';

const ENTRIES = [
  './initialize.ts',
  './navigation.ts',
  './serviceworker.ts',

  './extensions/codeblock.ts',
  './extensions/footnote.ts',
  './extensions/media.ts',
  './extensions/slider.ts',

  './webworker/hl-worker.ts',
  './webworker/hl-sharedworker.ts',
];

const OUT_DIR = './dist';

const fatalLevels = new Set(['warn', 'error']);

const makeConfig = (input: string): RolldownOptions => ({
  input,
  output: {
    dir: OUT_DIR,
    minify: true,
  },
  onLog: (level: LogLevel, log: RollupLog, _defaultHandler: LogOrStringHandler): void => {
    console.log(log.message);

    // If you don't set it, the build seems to proceed without interruption even if warnings exist,
    // but I don't know the correct way to stop it...
    if (fatalLevels.has(level)) {
      throw new Error(log.message);
    }
  },
});

export default defineConfig(ENTRIES.map(makeConfig));
