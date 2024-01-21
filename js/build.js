const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';
const CLR_Y = '\x1b[33m';

console.info(`[INFO]: 👩🏼‍🍳 I'm going to bake ${CLR_BC}bun${CLR_RESET} now!`);
const start = performance.now();

const result = await Bun.build({
  entrypoints: ['./book.js', './hl-worker.js', './serviceworker.js'],
  outdir: './dist',
  target: 'bun',
  format: 'esm',
  minify: true,
});

if (!result.success) {
  throw new AggregateError(result.logs, 'Build Failed');
}

for (const message of result.logs) {
  console.log(message);
}

const time = Math.floor(performance.now() - start) / 1000;
console.info(`    ${CLR_BG}Finished${CLR_RESET} release target(s) in ${time}s 😋${CLR_Y}Yummy!!${CLR_RESET}`);
