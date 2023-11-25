const result = await Bun.build({
  entrypoints: ['./book.js', './hl-worker.js', './searcher.js', './serviceworker.js'],
  outdir: './dist',
  minify: true,
});

if (!result.success) {
  throw new AggregateError(result.logs, 'Build Failed');
}

for (const message of result.logs) {
  console.log(message);
}
