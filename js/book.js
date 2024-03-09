import { procCodeBlock } from './codeblock.js';
import { globalSearchInit, searchInit } from './searcher.js';
import { sidebarInit } from './sidebar.js';

import initWasm, { attribute_external_links } from './wasm_book.js';

import { initTableOfContents } from './table-of-contents.js';
import { initThemeSelector } from './theme-selector.js';

const initialize = async () => {
  const root = document.getElementById('bookjs').dataset.pathtoroot;

  const [config, _] = await Promise.all([
    fetch(`${root}searchindex.json`).then(response => response.json()),
    initWasm(),

    initTableOfContents(),
    procCodeBlock(),
    initThemeSelector(),
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
