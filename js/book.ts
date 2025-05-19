import { initCodeBlock } from './codeblock';
import { initFootnote } from './footnote';
import { doSearchOrMarkFromUrl } from './mark';
import { startupSearch } from './searcher';
import { initSidebar } from './sidebar';
import { initTableOfContents } from './table-of-contents';
import { initThemeColor } from './theme-selector';

import initWasm, { attribute_external_links } from './wasm_book';

type DataSet = DOMStringMap & {
  pathtoroot: string;
};

const wasmPromise = initWasm();

const initialize = async (): Promise<void> => {
  initTableOfContents();
  initCodeBlock();
  initFootnote();

  await wasmPromise;
  doSearchOrMarkFromUrl();
  attribute_external_links();
};

((): void => {
  const rootPath = (document.getElementById('bookjs')?.dataset as DataSet).pathtoroot;

  initThemeColor(rootPath);
  initSidebar(rootPath);
  startupSearch(rootPath);

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
})();
