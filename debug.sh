npm run debug --prefix scss theme/chrome.scss ../theme/css/chrome.css
npm run debug --prefix scss theme/general.scss ../theme/css/general.css
npm run debug --prefix scss fonts/fonts.scss ../src/fonts/fonts.css
npm run debug --prefix scss style.scss ../css/style.css

npm run uglifyjs --prefix js -input='start.js' -output='../src/start.js'
npm run uglifyjs --prefix js -input='searcher.js' -output='../src/searcher.js'
npm run uglifyjs --prefix js -input='book.js' -output='../theme/book.js'
mkdir js/dist
npm run uglifyjs --prefix js -input='pagetoc.js' -output='dist/pagetoc.js'

mdbook build
