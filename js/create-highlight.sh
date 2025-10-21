#!/usr/bin/env bash

git clone https://github.com/highlightjs/highlight.js.git -b 11.11.0 --depth 1 highlight
pushd highlight

npm install
node tools/build.js -n bash diff json lua vim

popd
