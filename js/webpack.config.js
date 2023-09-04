const book = {
  mode: 'production',
  entry: './book.js',
  output: {
    filename: 'book.js'
  }
};

const searcher = {
  mode: 'production',
  entry: './searcher.js',
  output: {
    filename: 'searcher.js'
  }
};

module.exports = [book, searcher];
