npm run build --prefix js
cp -r js/dist/ src/

npm run compress --prefix js -input='serviceworker.js' -output='../src/serviceworker.js'

npm run compile --prefix scss style.scss ../src/css/style.css
npm run compile --prefix scss fonts/fonts.scss ../theme/fonts/fonts.css
npm run compile --prefix scss theme/chrome.scss ../theme/css/chrome.css
npm run compile --prefix scss theme/general.scss ../theme/css/general.css

pushd rs/wasm
wasm-pack build --target web
pushd

npm run compress --prefix js -input='../rs/wasm/pkg/wasm.js' -output='../src/wasm.js'
cp rs/wasm/pkg/wasm_bg.wasm src

mdbook build --dest-dir commentary

#rm commentary/ayu-highlight.css
#rm commentary/highlight.css
#rm commentary/tomorrow-night.css
#rm commentary/css/variables.css
#rm commentary/mark.min.js
#rm -rf commentary/FontAwesome

echo '\n🐥 complete!'
