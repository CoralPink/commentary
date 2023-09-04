git clone https://github.com/highlightjs/highlight.js.git -b 11.8.0 --depth 1
cd highlight.js

npm install
node tools/build.js -n bash diff json lua plaintext vim

cd ..
