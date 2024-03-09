import { codeBlock } from './codeblock.js';
import { globalSearchInit, searchInit } from './searcher.js';
import { sidebarInit } from './sidebar.js';

import wasmInit, { attribute_external_links } from './wasm_book.js';

import { initTableOfContents } from './table-of-contents.js';
import ThemeSelector from './theme-selector.js';

const initialize = async () => {
  const root = document.getElementById('bookjs').dataset.pathtoroot;

  const [config, _] = await Promise.all([
    fetch(`${root}searchindex.json`).then(response => response.json()),

    wasmInit(),
    codeBlock(),
    initTableOfContents(),

    new ThemeSelector(),
  ]);

  attribute_external_links();
  searchInit(root, config);

  // Suppress "submit" events so the page doesn't reload when the user presses Enter
  document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });
};

(() => {
  globalSearchInit();
  sidebarInit();

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });
})();
