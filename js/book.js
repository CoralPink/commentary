import { procCodeBlock } from './codeblock.js';
import { initGlobalSearch, initSearch } from './searcher.js';
import { initSidebar } from './sidebar.js';
import { initTableOfContents } from './table-of-contents.js';
import { initTheme, initThemeSelector } from './theme-selector.js';

import initWasm, { attribute_external_links } from './wasm_book.js';

const initialize = async () => {
  const root = document.getElementById('bookjs').dataset.pathtoroot;

  const [config, _] = await Promise.all([
    fetch(`${root}searchindex.json`).then(response => response.json()),
    initWasm({ module_or_path: './wasm_book_bg.wasm' }),

    initTableOfContents(),
    procCodeBlock(),
    initThemeSelector(),
  ]);

  attribute_external_links();
  initSearch(root, config);

  // Suppress "submit" events so the page doesn't reload when the user presses Enter
  document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
};

(() => {
  initSidebar();
  initTheme();
  initGlobalSearch();

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });
})();
