git clone https://github.com/highlightjs/highlight.js.git -b 11.9.0 --depth 1
cd highlight.js

npm install
bun tools/build.js -n bash diff json lua vim

cd ..
