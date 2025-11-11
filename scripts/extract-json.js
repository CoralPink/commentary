import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';

const FILE_INDEX = 'searchindex';

(() => {
  const start = performance.now();
  const sandbox = {};

  const extract = () => {
    const jsFile = `${FILE_INDEX}.js`;

    try {
      return readFileSync(`${jsFile}`, 'utf8');
    } catch (error) {
      console.error(`Error reading ${jsFile}`, error.message);
      process.exit(1);
    }
  };

  // biome-ignore lint/security/noGlobalEval: Using eval in a controlled sandbox to execute the JS from searchindex.js
  eval(`
    const window = {};
    window.search = {};

    ${extract()}

    sandbox.result = window.search;
  `);

  const jsonFile = `${FILE_INDEX}.json`;

  try {
    writeFileSync(jsonFile, JSON.stringify(sandbox.result));
  } catch (error) {
    console.error(`Error writing ${jsonFile}`, error.message);
    process.exit(1);
  }

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(
    `\n${CLR_BG}✔ ${CLR_BC}extract-json${CLR_RESET} Finished in ${CLR_BG}${time} s${CLR_RESET}`,
  );
})();
