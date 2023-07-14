npm run compress --prefix js -input='book.js' -output='../theme/book.js'
npm run compress --prefix js -input='searcher.js' -output='../src/searcher.js'
npm run compress --prefix js -input='serviceworker.js' -output='../src/serviceworker.js'

cp js/highlight.min.js src

cp js/node_modules/clipboard/dist/clipboard.min.js src
cp js/node_modules/fzf/dist/fzf.umd.js src
cp js/node_modules/mark.js/dist/mark.es6.min.js src

npm run debug --prefix scss style.scss ../css/style.css
npm run debug --prefix scss fonts/fonts.scss ../theme/fonts/fonts.css
npm run debug --prefix scss theme/chrome.scss ../theme/css/chrome.css
npm run debug --prefix scss theme/general.scss ../theme/css/general.css

pushd rs/wasm
wasm-pack build --target web
pushd

cp rs/wasm/pkg/wasm.js src
cp rs/wasm/pkg/wasm_bg.wasm src

mdbook build --dest-dir commentary

#rm commentary/ayu-highlight.css
#rm commentary/highlight.css
#rm commentary/tomorrow-night.css
#rm commentary/css/variables.css
#rm commentary/mark.min.js
#rm -rf commentary/FontAwesome

echo '\n🐥 complete!'
