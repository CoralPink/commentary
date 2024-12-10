import { procCodeBlock } from './codeblock.js';
import { startupSearch } from './searcher.js';
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

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
})();
