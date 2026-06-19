set -eu

pushd rs/wasm

cargo build --release --target wasm32-unknown-unknown

wasm-bindgen \
  ./target/wasm32-unknown-unknown/release/wasm_book.wasm \
  --target web \
  --out-dir pkg

wasm-opt ./pkg/wasm_book_bg.wasm \
  -O \
  --enable-simd \
  --enable-nontrapping-float-to-int \
  --enable-bulk-memory \
  --strip-debug \
  --strip-producers \
  --strip-dwarf \
  -o ./pkg/wasm_book_bg.opt.wasm

mv ./pkg/wasm_book_bg.opt.wasm ./pkg/wasm_book_bg.wasm

cp pkg/wasm_book.js ../../js
cp pkg/wasm_book.d.ts ../../js
cp pkg/wasm_book_bg.wasm ../../src

popd

pushd js
if [ ! -e highlight.js ]; then
  ./create-highlight.sh
fi
deno task bundle
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
deno task build
cp -r dist/ ../src/css/
popd

SECONDS=0
mdbook build --dest-dir commentary
echo "\x1b[1;32m✔\x1b[0m \x1b[1;35mmdbook\x1b[0m Finished in \x1b[32m$SECONDS s\x1b[0m\n"

pushd commentary
DEBUG=--debug deno task --config ../scripts/deno.jsonc regenerate
brotli searchindex.json
gzip --best --keep --no-name searchindex.json
popd

#pushd commentary
#rm ayu-highlight.css
#rm book.js
#rm clipboard.min.js
#rm elasticlunr.min.js
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
