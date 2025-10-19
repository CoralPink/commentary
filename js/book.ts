import { initCodeBlock } from './codeblock.ts';
import { initFootnote } from './footnote.ts';
import { attributeExternalLinks } from './link.ts';
import { doMarkFromUrl } from './mark.ts';
import { initVideo, initMedia } from './media.ts';
import { startupSearch } from './searcher.ts';
import { initSidebar } from './sidebar.ts';
import { initTableOfContents } from './table-of-contents.ts';
import { initThemeColor } from './theme-selector.ts';

type DataSet = DOMStringMap & {
  pathtoroot: string;
};

const initialize = (): void => {
  initTableOfContents();
  initCodeBlock();

  doMarkFromUrl();
  attributeExternalLinks();

  initFootnote();
  initVideo();
};

((): void => {
  const rootPath = (document.getElementById('bookjs')?.dataset as DataSet).pathtoroot;

  initThemeColor(rootPath);
  initSidebar(rootPath);
  initMedia(rootPath);

  startupSearch(rootPath);

  document.addEventListener('DOMContentLoaded', initialize, { once: true, passive: true });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => { }, { once: false, passive: true });
  }
})();
