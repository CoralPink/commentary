set -eu

pushd rs/wasm
wasm-pack build --target web
cp pkg/wasm_book.js ../../js
cp pkg/wasm_book_bg.wasm ../../src
pushd

pushd js
if [ ! -e ./node_modules ]; then
  bun install
fi
if [ ! -e ./highlight.js ]; then
  bun create-highlight.bun.sh
fi
bun run build.js
cp -r dist/. ../src/
pushd

pushd scss
if [ ! -e ./node_modules ]; then
  bun install
fi
bun run compile general.scss ../src/css/general.css
bun run compile style.scss ../src/css/style.css
bun run compile catppuccin/au-lait.scss ../src/css/theme/au-lait.css
bun run compile catppuccin/frappe.scss ../src/css/theme/frappe.css
bun run compile catppuccin/latte.scss ../src/css/theme/latte.css
bun run compile catppuccin/macchiato.scss ../src/css/theme/macchiato.css
bun run compile catppuccin/mocha.scss ../src/css/theme/mocha.css
pushd

mdbook build --dest-dir commentary

#rm commentary/ayu-highlight.css
#rm commentary/clipboard.min.js
#rm commentary/elasticlunr.min.js
#rm commentary/favicon.png
#rm commentary/fonts.css
#rm commentary/highlight.css
#rm commentary/highlight.js
#rm commentary/searcher.js
#rm commentary/tomorrow-night.css
#rm commentary/css/chrome.css
#rm commentary/css/variables.css
#rm commentary/mark.min.js
#rm -rf commentary/searchindex.js
#rm -rf commentary/FontAwesome
#rm -rf commentary/fonts

echo '\n🐥 complete!'
