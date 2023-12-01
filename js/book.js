import wasmInit, { attribute_external_links } from './wasm_book.js';

import { codeBlock } from './codeblock.js';

import TableOfContents from './table-of-contents.js';
import ThemeSelector from './theme-selector.js';

import './sidebar.js';

const chapterNavigation = () => {
  document.addEventListener(
    'keyup',
    e => {
      if (globalThis.search.hasFocus()) {
        return;
      }

      if (e.key === 'ArrowRight') {
        const nextButton = document.getElementById('main').querySelector('.nav-chapters.next');

        if (nextButton) {
          globalThis.location.href = nextButton.href;
        }
      } else if (e.key === 'ArrowLeft') {
        const previousButton = document.getElementById('main').querySelector('.nav-chapters.previous');

        if (previousButton) {
          globalThis.location.href = previousButton.href;
        }
      }
    },
    { once: false, passive: true },
  );
};

wasmInit()
  .then(() => {
    attribute_external_links();
  })
  .catch(error => {
    console.error('Error Attribute external links: ', error);
  });

document.addEventListener(
  'DOMContentLoaded',
  () => {
    codeBlock();

    new TableOfContents();
    new ThemeSelector();

    chapterNavigation();
  },
  { once: true, passive: true },
);
