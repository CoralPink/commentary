const book = {
  mode: 'production',
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
  entry: './searcher.js',
  output: {
    filename: 'searcher.js'
  },
};

const serviceworker = {
  mode: 'production',
  entry: './serviceworker.js',
  output: {
    filename: 'serviceworker.js'
  },
};

module.exports = [book, searcher, serviceworker];
