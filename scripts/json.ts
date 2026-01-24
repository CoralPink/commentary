import * as g from './global.ts';

const FILE_INDEX = `${g.PATH_DIRECTORY}searchindex`;

const extract = async (): Promise<string> => {
  const input = `${FILE_INDEX}.js`;

  try {
    return await Deno.readTextFile(input);
  } catch (error: unknown) {
    console.error(`Error reading ${input}: ${error}`);
    Deno.exit(1);
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
    await Deno.writeTextFile(output, JSON.stringify(sandbox.result));
  } catch (error: unknown) {
    console.error(`Error writing ${output}: ${error}`);
    Deno.exit(1);
  }
};

(async () => {
  const start = performance.now();

  await main();

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`${g.CLR_BG}✔ ${g.CLR_BC}json${g.CLR_RESET} Finished in ${g.CLR_BG}${time} s${g.CLR_RESET}\n`);
})();
