#!/usr/bin/env bash

git clone --depth 1 --branch 11.11.2 \
  https://github.com/highlightjs/highlight.js.git highlight

pushd highlight || exit 1

npm install
node tools/build.js -n bash diff json lua vim

cp build/highlight.js ..

popd || exit 1

rm -rf highlight
