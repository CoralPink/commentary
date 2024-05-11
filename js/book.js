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
    initWasm(),

    initTableOfContents(),
    procCodeBlock(),
    initThemeSelector(),
  ]);

  attribute_external_links();
  initSearch(root, config);

  // Suppress "submit" events so the page doesn't reload when the user presses Enter
  document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });
};

(() => {
  initSidebar();
  initTheme();
  initGlobalSearch();

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });
})();
