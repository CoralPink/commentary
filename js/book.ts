import { initialize, setOnNavigate } from "./navigate.ts";
import { initSidebar } from "./sidebar.ts";
import { initThemeColor } from "./theme-selector.ts";
import { updateActive } from "./sidebar.ts";
import { initTableOfContents } from './table-of-contents.ts';

((): void => {
  initThemeColor();
  initSidebar();
  initTableOfContents();

  setOnNavigate(updateActive);

  document.addEventListener("DOMContentLoaded", initialize, {
    once: true,
    passive: true,
  });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener("touchstart", () => {}, {
      once: false,
      passive: true,
    });
  }
})();
