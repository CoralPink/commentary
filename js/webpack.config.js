const book = {
  mode: 'production',
  target: ['web', 'es2023'],
  entry: './book.js',
  output: {
    filename: 'book.js'
  },
  experiments: {
    asyncWebAssembly: true
  },
};

const searcher = {
  mode: 'production',
  target: ['web', 'es2023'],
  entry: './searcher.js',
  output: {
    filename: 'searcher.js'
  },
};

const serviceworker = {
  mode: 'production',
  target: ['web', 'es2023'],
  entry: './serviceworker.js',
  output: {
    filename: 'serviceworker.js'
  },
};

module.exports = [book, searcher, serviceworker];
