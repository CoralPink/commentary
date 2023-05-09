npm run compress --prefix js -input='book.js' -output='../theme/book.js'
npm run compress --prefix js -input='searcher.js' -output='../src/searcher.js'
npm run compress --prefix js -input='start.js' -output='../src/start.js'

cp js/node_modules/clipboard/dist/clipboard.min.js src
cp js/node_modules/fzf/dist/fzf.umd.js src
cp js/node_modules/mark.js/dist/mark.es6.min.js src

npm run debug --prefix scss style.scss ../css/style.css
npm run debug --prefix scss fonts/fonts.scss ../theme/fonts/fonts.css
npm run debug --prefix scss theme/chrome.scss ../theme/css/chrome.css
npm run debug --prefix scss theme/general.scss ../theme/css/general.css

mdbook build

#rm book/ayu-highlight.css
#rm book/highlight.css
#rm book/highlight.js
#rm book/tomorrow-night.css
#rm book/css/variables.css
#rm book/mark.min.js
#rm -rf book/FontAwesome
#echo 'Complete!!'
