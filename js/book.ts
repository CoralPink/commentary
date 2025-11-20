import { initialize, setOnNavigate } from './navigate.ts';
import { startupSearch } from './searcher.ts';
import { initSidebar, updateActive } from './sidebar.ts';
import { initTableOfContents } from './table-of-contents.ts';
import { initThemeColor } from './theme-selector.ts';

((): void => {
  setOnNavigate(updateActive);

  initThemeColor();
  initSidebar();
  initTableOfContents();

  startupSearch();

  document.addEventListener('DOMContentLoaded', initialize, {
    once: true,
    passive: true,
  });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, {
      once: false,
      passive: true,
    });
  }
})();
