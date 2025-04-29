import { initCodeBlock } from './codeblock';
import { initFootnote } from './footnote';
import { startupSearch } from './searcher';
import { initSidebar } from './sidebar';
import { initTableOfContents } from './table-of-contents';
import { initThemeColor } from './theme-selector';

import initWasm, { attribute_external_links } from './wasm_book';

type DataSet = DOMStringMap & {
  pathtoroot: string;
};

const wasmPromise = initWasm();
const rootPath = (document.getElementById('bookjs')?.dataset as DataSet).pathtoroot;

const initialize = async (): Promise<void> => {
  initTableOfContents();
  initCodeBlock();
  initFootnote();

  try {
    await wasmPromise;

    attribute_external_links();
    startupSearch(rootPath);
  } catch (err) {
    console.error(err);
  }
};

((): void => {
  initThemeColor(rootPath);
  initSidebar(rootPath);

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
})();
