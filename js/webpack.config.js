const book = {
  mode: 'production',
  target: ['web', 'es2023'],
  entry: './book.js',
  output: {
    filename: 'book.js',
  },
  experiments: {
    asyncWebAssembly: true,
  },
};

module.exports = [book];
