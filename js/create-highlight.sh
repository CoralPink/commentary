#!/usr/bin/env bash

git clone https://github.com/highlightjs/highlight.js.git -b 11.11.0 --depth 1 highlight
pushd highlight || exit 1

npm install
node tools/build.js -n bash diff json lua vim

popd || exit 1
