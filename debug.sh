pushd rs/wasm
wasm-pack build --target bundler
cd pkg
npm link
pushd

pushd js
npm link wasm-book
npm run build
npm run compress -input='serviceworker.js' -output='dist/serviceworker.js'
cp -r dist/. ../src/
pushd

pushd scss
npm run compile style.scss ../src/css/style.css
npm run compile fonts/fonts.scss ../theme/fonts/fonts.css
npm run compile theme/chrome.scss ../theme/css/chrome.css
npm run compile theme/general.scss ../theme/css/general.css
pushd

mdbook build --dest-dir commentary

#rm commentary/ayu-highlight.css
#rm commentary/highlight.css
#rm commentary/tomorrow-night.css
#rm commentary/css/variables.css
#rm commentary/mark.min.js
#rm -rf commentary/FontAwesome

echo '\n🐥 complete!'
