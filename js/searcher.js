import Finder from './finder.js';
import { initTableOfContents } from './table-of-contents.js';
import { SearchResult, marking, unmarking } from './wasm_book.js';

const ELEM_BAR = document.getElementById('searchbar');
const ELEM_WRAPPER = document.getElementById('search-wrapper');
const ELEM_RESULTS = document.getElementById('searchresults');
const ELEM_ICON = document.getElementById('search-toggle');

const ELEM_HEADER = document.getElementById('searchresults-header');
const ELEM_OUTER = document.getElementById('searchresults-outer');

let searchResult;
let finder;

let prevTerms;

const unmarkHandler = () => {
  const main = document.getElementById('main');

  for (const x of main.querySelectorAll('mark')) {
    x.removeEventListener('mouseup', unmarkHandler, { once: true, passive: true });
  }
  main.innerHTML = unmarking(main.innerHTML);

  initTableOfContents();
};

const escapeHtml = str =>
  decodeURIComponent(str).replace(/[&<>"']/g, match => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[match];
  });

// On reload or browser history backwards/forwards events, parse the url and do search or mark
const doSearchOrMarkFromUrl = () => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }
  const terms = escapeHtml(params);
  ELEM_BAR.value = terms;

  marking(terms);

  for (const x of main.querySelectorAll('mark')) {
    x.addEventListener('mouseup', unmarkHandler, { once: true, passive: true });
  }
};

const searchHandler = () => {
  const terms = ELEM_BAR.value.trim();

  if (terms === prevTerms) {
    return;
  }
  prevTerms = terms;

  if (terms === '') {
    ELEM_OUTER.classList.add('hidden');
    return;
  }

  // If the input is a 1 character and is a single-byte character, the search process is not performed.
  if (terms.length <= 1 && terms.charCodeAt() <= 127) {
    return;
  }
  ELEM_RESULTS.innerHTML = '';

  const results = finder.search(terms);

  if (results.length === 0) {
    ELEM_HEADER.innerText = `No search result for : ${terms}`;
    return;
  }
  ELEM_HEADER.innerText = `${results.length} search results for : ${terms}`;
  searchResult.append_search_result(results, terms);

  ELEM_OUTER.classList.remove('hidden');
};

// TODO: This funny code is because Firefox still won't let me use Popover (by default)!
const searchPopupHandler = ev => {
  if (ELEM_WRAPPER.classList.contains('hidden') || ELEM_ICON.contains(ev.target)) {
    return;
  }

  if (!ELEM_WRAPPER.contains(ev.target)) {
    hiddenSearch();
    return;
  }

  if (ev.target.tagName !== 'A') {
    return;
  }

  const currentURL = window.location.origin + window.location.pathname;
  const clickedURL = ev.target.origin + ev.target.pathname;

  if (currentURL === clickedURL) {
    hiddenSearch();
    unmarkHandler();
    doSearchOrMarkFromUrl();
  }
};

const hiddenSearch = () => {
  ELEM_WRAPPER.classList.add('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'false');

  document.removeEventListener('mouseup', searchPopupHandler, { once: false, passive: true });
};

const showSearch = () => {
  ELEM_WRAPPER.classList.remove('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'true');
  ELEM_BAR.select();

  document.addEventListener('mouseup', searchPopupHandler, { once: false, passive: true });
};

export const initSearch = (root, config) => {
  doSearchOrMarkFromUrl();

  try {
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
};

export const initGlobalSearch = () => {
  globalThis.search = globalThis.search || {};
  globalThis.search.hasFocus = () => ELEM_BAR === document.activeElement;
};
