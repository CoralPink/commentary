import fs from 'node:fs';

const FILE_INDEX = 'searchindex';

(() => {
  const sandbox = {};

  const extract = () => {
    const jsFile = `${FILE_INDEX}.js`;

    try {
      return fs.readFileSync(`${jsFile}`, 'utf8');
    } catch (error) {
      console.error(`Error reading ${jsFile}`, error.message);
      process.exit(1);
    }
  };

  // biome-ignore lint/security/noGlobalEval: Using eval in a controlled sandbox to execute the JS from searchindex.js
  eval(`
    const window = {};
    ${extract()}
    sandbox.result = window.search;
  `);

  const jsonFile = `${FILE_INDEX}.json`;

  try {
    fs.writeFileSync(jsonFile, JSON.stringify(sandbox.result));
    console.info('    \x1b[1;32mFinished\x1b[0m convert search index \x1b[33m🧶Did it!!\x1b[0m');
  } catch (error) {
    console.error(`Error writing ${jsonFile}`, error.message);
    process.exit(1);
  }
})();
