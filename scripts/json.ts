import * as g from './global.ts';

import { readFile, writeFile } from 'node:fs/promises';

const FILE_INDEX = `${g.PATH_DIRECTORY}searchindex`;

const extract = async (): Promise<string> => {
  const input = `${FILE_INDEX}.js`;

  try {
    return await readFile(input, 'utf8');
  } catch (error: unknown) {
    console.error(`Error reading ${input}: ${error}`);
    throw error;
  }
};

const main = async (): Promise<void> => {
  const source = await extract();
  const sandbox: { result?: unknown } = {};

  const fn = new Function(
    'sandbox',
    `
      const window = {};
      window.search = {};
      ${source}
      sandbox.result = window.search;
    `,
  );

  fn(sandbox);

  const output = `${FILE_INDEX}.json`;

  try {
    await writeFile(output, JSON.stringify(sandbox.result));
  } catch (error: unknown) {
    console.error(`Error writing ${output}: ${error}`);
    process.exitCode = 1;
  }
};

(async () => {
  const start = performance.now();

  await main();

  const time = Math.floor(performance.now() - start);
  console.info(`${g.CLR_BG}✔ ${g.CLR_BC}json${g.CLR_RESET} Finished in ${g.CLR_BG}${time} ms${g.CLR_RESET}`);
})();
