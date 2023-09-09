await Bun.build({
  entrypoints: ['./searcher.js', './serviceworker.js'],
  outdir: './dist',
  minify: true,
});
