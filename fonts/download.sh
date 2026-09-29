#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
FONT_DIR="$ROOT_DIR/fonts"
TMP_DIR="$FONT_DIR/tmp"
OUTPUT_DIR="$FONT_DIR/woff2"

rm -rf "$TMP_DIR"
trap 'rm -rf "$TMP_DIR"' EXIT

NERD_FONTS_VERSION='3.5.1'
NERD_FONTS_SHA256='01172f37db8543edb102e5cb5c64101c9f4686630804d49b419aa07b23a69996'
OPEN_SANS_VERSION='3.003'
OPEN_SANS_COMMIT='bd7e376'
OPEN_SANS_SHA256='2dbf827812cf89ecc25f10c995fd7dddf47277be13741c10b963e2351574ba93'
FIRA_CODE_VERSION='6.2'
FIRA_CODE_SHA256='0949915ba8eb24d89fd93d10a7ff623f42830d7c5ffc3ecbf960e4ecad3e3e79'

mkdir -p \
  "$TMP_DIR/nerd-fonts" \
  "$TMP_DIR/open-sans" \
  "$TMP_DIR/fira-code" \
  "$OUTPUT_DIR"

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

verify_sha256() {
  expected="$1"
  file="$2"
  actual=$(sha256 "$file")

  if [ "$actual" != "$expected" ]; then
    echo "SHA-256 mismatch: $file" >&2
    echo "Expected: $expected" >&2
    echo "Actual:   $actual" >&2
    exit 1
  fi
}

curl --fail --location \
  "https://github.com/ryanoasis/nerd-fonts/releases/download/v${NERD_FONTS_VERSION}/NerdFontsSymbolsOnly.tar.xz" \
  --output "$TMP_DIR/nerd-fonts.tar.xz"

curl --fail --location \
  "https://codeload.github.com/googlefonts/opensans/tar.gz/${OPEN_SANS_COMMIT}" \
  --output "$TMP_DIR/open-sans.tar.gz"

curl --fail --location \
  "https://github.com/tonsky/FiraCode/releases/download/${FIRA_CODE_VERSION}/Fira_Code_v${FIRA_CODE_VERSION}.zip" \
  --output "$TMP_DIR/fira-code.zip"

verify_sha256 \
  "$NERD_FONTS_SHA256" \
  "$TMP_DIR/nerd-fonts.tar.xz"

verify_sha256 \
  "$OPEN_SANS_SHA256" \
  "$TMP_DIR/open-sans.tar.gz"

verify_sha256 \
  "$FIRA_CODE_SHA256" \
  "$TMP_DIR/fira-code.zip"

tar -xf "$TMP_DIR/nerd-fonts.tar.xz" \
  -C "$TMP_DIR/nerd-fonts"

tar -xf "$TMP_DIR/open-sans.tar.gz" \
  -C "$TMP_DIR/open-sans"

unzip -q "$TMP_DIR/fira-code.zip" \
  -d "$TMP_DIR/fira-code"

uv run "$FONT_DIR/convert.py" \
  "$TMP_DIR/nerd-fonts/SymbolsNerdFontMono-Regular.ttf" \
  "$OUTPUT_DIR"

uv run "$FONT_DIR/convert.py" \
  "$TMP_DIR/open-sans/opensans-${OPEN_SANS_COMMIT}/fonts/ttf/OpenSans-BoldItalic.ttf" \
  "$OUTPUT_DIR"

uv run "$FONT_DIR/convert.py" \
  "$TMP_DIR/open-sans/opensans-${OPEN_SANS_COMMIT}/fonts/ttf/OpenSans-Italic.ttf" \
  "$OUTPUT_DIR"

cp \
  "$TMP_DIR/fira-code/woff2/FiraCode-VF.woff2" \
  "$OUTPUT_DIR/"
