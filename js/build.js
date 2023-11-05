await Bun.build({
  entrypoints: ['./book.js', './hl-worker.js', './searcher.js', './serviceworker.js'],
  outdir: './dist',
  minify: true,
});
