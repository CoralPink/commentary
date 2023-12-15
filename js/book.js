import wasmInit, { attribute_external_links } from './wasm_book.js';

import { codeBlock } from './codeblock.js';

import TableOfContents from './table-of-contents.js';
import ThemeSelector from './theme-selector.js';

import './sidebar.js';

wasmInit()
  .then(() => {
    attribute_external_links();
  })
  .catch(e => {
    console.error(`Error Attribute external links: ${e}`);
  });

document.addEventListener(
  'DOMContentLoaded',
  () => {
    codeBlock();

    new TableOfContents();
    new ThemeSelector();
  },
  { once: true, passive: true },
);
