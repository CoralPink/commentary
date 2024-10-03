import Finder from './finder.js';
import { tocReset } from './table-of-contents.js';
import { SearchResult, marking, unmarking } from './wasm_book.js';

const ELEM_WRAPPER = document.getElementById('search-wrapper');
const ELEM_BAR = document.getElementById('searchbar');
const ELEM_ICON = document.getElementById('search-toggle');

const ELEM_OUTER = document.getElementById('searchresults-outer');
const ELEM_HEADER = document.getElementById('searchresults-header');
const ELEM_RESULTS = document.getElementById('searchresults');

let searchResult;
let finder;

let prevTerms;

let pathToRoot;
const handleKeyup = ev => startSearchFromKey(ev.key);

const unmarkHandler = () => {
  const main = document.getElementById('main');

  for (const x of main.querySelectorAll('mark')) {
    x.removeEventListener('mouseup', unmarkHandler);
  }
  unmarking();
  tocReset();
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

  ELEM_RESULTS.innerText = '';
  ELEM_OUTER.showPopover();

  // If the input is less than one half-width character, the search process is not carried out.
  if (terms.length === 0 || (terms.length <= 1 && terms.charCodeAt() <= 127)) {
    ELEM_HEADER.innerText = '2文字 (もしくは全角1文字) 以上を入力してください。';
    return;
  }

  const results = finder.search(terms);

  if (results.length === 0) {
    ELEM_HEADER.innerText = `No search result for : ${terms}`;
    return;
  }
  ELEM_HEADER.innerText = `${results.length} search results for : ${terms}`;
  searchResult.append_search_result(results, terms);
};

const popupHandler = ev => {
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
};

const showSearch = () => {
  ELEM_WRAPPER.classList.remove('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'true');
  ELEM_BAR.select();
};

const initSearch = () => {
  document.removeEventListener('keyup', handleKeyup);

  try {
    fetch(`${pathToRoot}searchindex.json`)
      .then(response => response.json())
      .then(config => {
        searchResult = new SearchResult(pathToRoot, config.results_options.teaser_word_count, config.doc_urls);
        finder = new Finder(config.index.documentStore.docs, config.results_options.limit_results);
      });
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.info('The search function is disabled.');

    ELEM_ICON.classList.add('hidden');
    return;
  }

  showSearch();

  ELEM_BAR.addEventListener('keyup', searchHandler, { once: false, passive: true });
  ELEM_OUTER.addEventListener('mouseup', popupHandler, { once: false, passive: true });

  ELEM_ICON.addEventListener(
    'mouseup',
    () => (ELEM_WRAPPER.classList.contains('hidden') ? showSearch() : hiddenSearch()),
    {
      once: false,
      passive: true,
    },
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

const startSearchFromKey = key => {
  switch (key) {
    case '/':
    case 's':
    case 'S':
      initSearch();
      break;
  }
};

export const startupSearch = root => {
  doSearchOrMarkFromUrl();

  pathToRoot = root;

  ELEM_ICON.addEventListener('mouseup', initSearch, { once: true, passive: true });
  document.addEventListener('keyup', handleKeyup, { once: false, passive: true });
};

export const initGlobalSearch = () => {
  globalThis.search = globalThis.search || {};
  globalThis.search.hasFocus = () => ELEM_BAR === document.activeElement;
};
