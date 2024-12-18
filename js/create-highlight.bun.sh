git clone https://github.com/highlightjs/highlight.js.git -b 11.11.0 --depth 1
cd highlight.js

bun install
bun tools/build.js -n bash diff json lua vim

cd ..
