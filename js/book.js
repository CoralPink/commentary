import { procCodeBlock } from './codeblock.js';
import { initGlobalSearch, startupSearch } from './searcher.js';
import { initSidebar } from './sidebar.js';
import { initTableOfContents } from './table-of-contents.js';
import { initThemeColor } from './theme-selector.js';

import initWasm, { attribute_external_links } from './wasm_book.js';

const initialize = () => {
  const rootPath = document.getElementById('bookjs').dataset.pathtoroot;

  initThemeColor(rootPath);
  initTableOfContents();
  procCodeBlock();

  initWasm().then(
    () => {
      attribute_external_links();
      startupSearch(rootPath);
    },
    err => console.error(err),
  );
};

(() => {
  initSidebar(document.getElementById('bookjs').dataset.pathtoroot);
  initGlobalSearch();

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });

  // Suppress "submit" events so the page doesn't reload when the user presses Enter
  document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
})();
