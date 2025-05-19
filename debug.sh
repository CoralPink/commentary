set -eu

pushd rs/wasm
wasm-pack build --target web
wasm-opt ./pkg/wasm_book_bg.wasm \
  -o ./pkg/wasm_book_bg.wasm \
  -O \
  --enable-nontrapping-float-to-int \
  --enable-bulk-memory
cp pkg/wasm_book.js ../../js
cp pkg/wasm_book.d.ts ../../js
cp pkg/wasm_book_bg.wasm ../../src
popd

pushd js
if [ ! -e ./node_modules ]; then
  bun install
fi
if [ ! -e ./highlight.js ]; then
  bun create-highlight.bun.sh
fi
bun run build.js
cp -r dist/. ../src/
popd

if [ ! -e ./src/woff2 ]; then
  pushd fonts
  mkdir -p ../src/woff2
  for font in \
    "NerdFontsSymbolsOnly/SymbolsNerdFontMono-Regular.ttf" \
    "Open_Sans/static/OpenSans-BoldItalic.ttf" \
    "Open_Sans/static/OpenSans-Italic.ttf"; do
    uv run convert.py "$font" ../src/woff2
  done
  cp "Fira Code/FiraCode-VF.woff2" ../src/woff2
  popd
fi

pushd scss
if [ ! -e ./node_modules ]; then
  bun install
fi
bun run build.js
cp -r dist/ ../src/css/
popd

mdbook build --dest-dir commentary

pushd commentary
../scripts/generate-pagelist.sh
node ../scripts/extract-json.js
brotli searchindex.json
gzip --best --keep --no-name searchindex.json
popd

#pushd commentary
#rm ayu-highlight.css
#rm clipboard.min.js
#rm elasticlunr.min.js
#rm favicon.png
#rm fonts.css
#rm highlight.css
#rm highlight.js
#rm mark.min.js
#rm searcher.js
#rm searchindex.js
#rm searchindex.json
#rm toc.html
#rm toc.js
#rm tomorrow-night.css
#rm css/chrome.css
#rm css/variables.css
#rm -rf FontAwesome
#rm -rf fonts
#popd

echo '\n🐥 complete!'
