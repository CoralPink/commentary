set -eu

pushd rs/wasm
wasm-pack build --target web
cp pkg/wasm_book.js ../../js
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
python3 -m venv myenv
source myenv/bin/activate
pip install --upgrade pip
pip install fonttools
pip install brotli
python convert.py NerdFontsSymbolsOnly/SymbolsNerdFontMono-Regular.ttf ../src/woff2
python convert.py Open_Sans/static/OpenSans-BoldItalic.ttf ../src/woff2
python convert.py Open_Sans/static/OpenSans-Italic.ttf ../src/woff2
cp Fira\ Code/FiraCode-VF.woff2 ../src/woff2
popd
fi

pushd scss
if [ ! -e ./node_modules ]; then
  bun install
fi
bun run compile chapter.scss ../src/css/chapter.css
bun run compile general.scss ../src/css/general.css
bun run compile search.scss ../src/css/search.css
bun run compile style.scss ../src/css/style.css
bun run compile theme-list.scss ../src/css/theme-list.css
for theme in au-lait frappe latte macchiato mocha; do
  if ! bun run compile "catppuccin/$theme.scss" "../src/css/theme/$theme.css"; then
    echo "Failed to compile $theme theme"
    exit 1
  fi
done
popd

mdbook build --dest-dir commentary

pushd commentary
sed \
  -e 's|<ol class="section">|<ol>|g' \
  -e 's|<li class="chapter-item expanded ">|<li>|g' \
  -e 's| target="_parent"||g' \
  toc.html > pagelist.html
popd

#pushd commentary
#rm ayu-highlight.css
#rm clipboard.min.js
#rm elasticlunr.min.js
#rm favicon.png
#rm fonts.css
#rm highlight.css
#rm highlight.js
#rm searcher.js
#rm toc.html
#rm toc.js
#rm tomorrow-night.css
#rm css/chrome.css
#rm css/variables.css
#rm mark.min.js
#rm -rf searchindex.js
#rm -rf FontAwesome
#rm -rf fonts
#popd

echo '\n🐥 complete!'
