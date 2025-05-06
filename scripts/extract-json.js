import fs from 'node:fs';

const FILE_INDEX = 'searchindex';

const jsName = `${FILE_INDEX}.js`;
const jsonName = `${FILE_INDEX}.json`;

const sandbox = {};

const extract = () => {
  try {
    return fs.readFileSync(`${jsName}`, 'utf8');
  } catch (error) {
    console.error(`Error reading ${jsName}`, error.message);
    process.exit(1);
  }
};

// biome-ignore lint/security/noGlobalEval: Using eval in a controlled sandbox to execute the JS from searchindex.js
eval(`
  const window = {};
  ${extract()}
  sandbox.result = window.search;
`);

try {
  fs.writeFileSync(jsonName, JSON.stringify(sandbox.result, null, 2));

  console.info(`✅ complete: ${jsonName}`);
} catch (error) {
  console.error(`Error writing ${jsonName}`, error.message);
  process.exit(1);
}
