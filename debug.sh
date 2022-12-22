npm run debug --prefix scss theme/chrome.scss ../theme/css/chrome.css
npm run debug --prefix scss theme/general.scss ../theme/css/general.css
npm run debug --prefix scss theme/variables.scss ../theme/css/variables.css
npm run debug --prefix scss fonts/fonts.scss ../src/fonts/fonts.css
npm run debug --prefix scss style.scss ../css/style.css

mkdir js/dist
npm run uglifyjs --prefix js -input='pagetoc.js' -output='dist/pagetoc.js'
npm run uglifyjs --prefix js -input='book.js' -output='../theme/book.js'
npm run uglifyjs --prefix js -input='searcher.js' -output='../src/searcher.js'

mdbook build
