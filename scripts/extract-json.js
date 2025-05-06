import fs from 'node:fs';

const code = fs.readFileSync('searchindex.js', 'utf8');
const sandbox = {};

// biome-ignore lint/security/noGlobalEval: Using eval in a controlled sandbox to execute the JS from searchindex.js
eval(`
  const window = {};
  ${code}
  sandbox.result = window.search;
`);

fs.writeFileSync('searchindex.json', JSON.stringify(sandbox.result, null, 2));
console.log('✅ complete: JS -> JSON');
