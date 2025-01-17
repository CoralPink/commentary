import { procCodeBlock } from './codeblock.js';
import { startupSearch } from './searcher.js';
import { initSidebar } from './sidebar.js';
import { initTableOfContents } from './table-of-contents.js';
import { initThemeColor } from './theme-selector.js';

import initWasm, { attribute_external_links } from './wasm_book.js';

interface DataSet extends DOMStringMap {
  pathtoroot?: string;
}

const initialize = (): void => {
  const rootPath = (document.getElementById('bookjs')?.dataset as DataSet).pathtoroot;

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

((): void => {
  initSidebar((document.getElementById('bookjs')?.dataset as DataSet).pathtoroot);

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
})();
