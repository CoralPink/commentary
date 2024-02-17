import { codeBlock } from './codeblock.js';
import { sidebarInit } from './sidebar.js';
import wasmInit, { SearchResult } from './wasm_book.js';

import Finder from './finder.js';
import Mark from './node_modules/mark.js/dist/mark.es6.js';
import TableOfContents from './table-of-contents.js';
import ThemeSelector from './theme-selector.js';

const ELEM_BAR = document.getElementById('searchbar');
const ELEM_WRAPPER = document.getElementById('search-wrapper');
const ELEM_RESULTS = document.getElementById('searchresults');
const ELEM_ICON = document.getElementById('search-toggle');

const ELEM_HEADER = document.getElementById('searchresults-header');
const ELEM_OUTER = document.getElementById('searchresults-outer');

const resultMarker = new Mark(ELEM_RESULTS);

let searchResult;
let finder;

let prevTerm;

const searchHandler = () => {
  const term = ELEM_BAR.value.trim();

  if (term === prevTerm) {
    return;
  }
  prevTerm = term;

  if (term === '') {
    ELEM_OUTER.classList.add('hidden');
    return;
  }

  // If the input is a 1 character and is a single-byte character, the search process is not performed.
  if (term.length <= 1 && term.charCodeAt() <= 127) {
    return;
  }
  ELEM_RESULTS.innerHTML = '';

  const results = finder.search(term);

  if (results.length === 0) {
    ELEM_HEADER.innerText = `No search result for : ${term}`;
    return;
  }
  ELEM_HEADER.innerText = `${results.length} search results for : ${term}`;
  searchResult.append_search_result(results, term);

  resultMarker.mark(decodeURIComponent(term).split(' '), {
    accuracy: 'complementary',
    exclude: ['a'],
  });

  ELEM_OUTER.classList.remove('hidden');
};

const showSearch = () => {
  ELEM_WRAPPER.classList.remove('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'true');
  ELEM_BAR.select();
};

const hiddenSearch = () => {
  ELEM_WRAPPER.classList.add('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'false');
};

// On reload or browser history backwards/forwards events, parse the url and do search or mark
const doSearchOrMarkFromUrl = () => {
  const param = new URLSearchParams(globalThis.location.search).get('highlight');

  if (!param) {
    return;
  }
  const term = decodeURIComponent(param);
  ELEM_BAR.value = term;

  const marker = new Mark(document.getElementById('main'));
  marker.mark(term.split(' '), {
    accuracy: 'complementary',
  });

  for (const x of document.querySelectorAll('mark')) {
    x.addEventListener('mousedown', marker.unmark, { once: true, passive: true });
  }
};

const attributeExternalLinks = () => {
  for (const el of document.getElementById('main').querySelectorAll('a[href^="http"]')) {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  }
};

const searchInit = async root => {
  globalThis.search = globalThis.search || {};
  globalThis.search.hasFocus = () => ELEM_BAR === document.activeElement;

  try {
    const [config, _] = await Promise.all([
      fetch(`${root}searchindex.json`).then(response => response.json()),
      wasmInit(),
    ]);

    searchResult = new SearchResult(root, config.results_options.teaser_word_count, config.doc_urls);
    finder = new Finder(config.index.documentStore.docs, config.results_options.limit_results);
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.log('The search function is disabled.');
    ELEM_ICON.classList.add('hidden');
    return;
  }

  ELEM_BAR.addEventListener('keyup', searchHandler, { once: false, passive: true });
  ELEM_ICON.addEventListener(
    'mouseup',
    () => (ELEM_WRAPPER.classList.contains('hidden') ? showSearch() : hiddenSearch()),
    { once: false, passive: true },
  );

  document.addEventListener(
    'keyup',
    e => {
      if (ELEM_WRAPPER.classList.contains('hidden')) {
        switch (e.key) {
          case '/':
          case 's':
          case 'S':
            showSearch();
            break;
        }
        return;
      }

      if (e.key === 'Escape') {
        hiddenSearch();
      }
    },
    { once: false, passive: true },
  );

  // Suppress "submit" events so the page doesn't reload when the user presses Enter
  document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });
};

(() => {
  sidebarInit();

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      codeBlock();

      new TableOfContents();
      new ThemeSelector();

      doSearchOrMarkFromUrl();
      attributeExternalLinks();

      searchInit(document.getElementById('bookjs').dataset.pathtoroot);
    },
    { once: true, passive: true },
  );
})();
