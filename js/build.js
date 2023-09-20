await Bun.build({
  entrypoints: ['./book.js', './searcher.js', './serviceworker.js'],
  outdir: './dist',
  minify: true,
});
