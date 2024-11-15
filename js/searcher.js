import Finder from './finder.js';
import { tocReset } from './table-of-contents.js';
import { SearchResult, marking, unmarking } from './wasm_book.js';
import { loadStyleSheet } from './css-loader.js';

const STYLE_SEARCH = 'css/delay-search.css';

const ELEM_WRAPPER = document.getElementById('search-wrapper');
const ELEM_BAR = document.getElementById('searchbar');
const ELEM_ICON = document.getElementById('search-toggle');

const ELEM_OUTER = document.getElementById('searchresults-outer');
const ELEM_HEADER = document.getElementById('searchresults-header');
const ELEM_RESULTS = document.getElementById('searchresults');

let rootPath;

let searchResult;
let finder;

let prevTerms;
let focusedLi;

const unmarkHandler = () => {
  const article = document.getElementById('article');

  for (const x of article.querySelectorAll('mark')) {
    x.removeEventListener('click', unmarkHandler);
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

  for (const x of article.querySelectorAll('mark')) {
    x.addEventListener('click', unmarkHandler, { once: true, passive: true });
  }
};

const jumpUrl = aElement => {
  if (aElement === null) {
    console.warn('The link does not exist.');
    return;
  }

  const url = new URL(aElement.href);

  const clickedURL = url.origin + url.pathname;
  const currentURL = window.location.origin + window.location.pathname;

  if (clickedURL === currentURL) {
    hiddenSearch();
    unmarkHandler();
    doSearchOrMarkFromUrl();
  }
  window.location.href = url.href;
};

const popupFocus = ev => {
  if (ev.key !== 'Enter') {
    return;
  }
  jumpUrl(ev.target.querySelector('a'));
};

const searchMouseupHandler = ev => {
  const li = ev.target.closest('li');

  if (li === null) {
    console.warn('The li element does not exist.');
    return;
  }

  if (li !== focusedLi) {
    focusedLi = li;
    return;
  }
  jumpUrl(li.querySelector('a'));
};

const handleKeyup = ev => {
  startSearchFromKey(ev.key);
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

const hiddenSearch = () => {
  ELEM_WRAPPER.style.visibility = 'hidden';
  ELEM_ICON.setAttribute('aria-expanded', 'false');

  ELEM_BAR.removeEventListener('keyup', searchHandler);
  ELEM_RESULTS.removeEventListener('keyup', popupFocus);
  ELEM_OUTER.removeEventListener('click', searchMouseupHandler);

  prevTerms = undefined;
};

const showSearch = () => {
  ELEM_WRAPPER.style.visibility = 'visible';
  ELEM_ICON.setAttribute('aria-expanded', 'true');

  ELEM_BAR.addEventListener('keyup', searchHandler, { once: false, passive: true });
  ELEM_RESULTS.addEventListener('keyup', popupFocus, { once: false, passive: true });
  ELEM_OUTER.addEventListener('click', searchMouseupHandler, { once: false, passive: true });

  ELEM_BAR.select();
};

const initSearch = () => {
  ELEM_ICON.removeEventListener('click', initSearch);
  document.removeEventListener('keyup', handleKeyup);

  try {
    loadStyleSheet(`${rootPath}${STYLE_SEARCH}`);

    fetch(`${rootPath}searchindex.json`)
      .then(response => response.json())
      .then(config => {
        searchResult = new SearchResult(rootPath, config.results_options.teaser_word_count, config.doc_urls);
        finder = new Finder(config.index.documentStore.docs, config.results_options.limit_results);
      });
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.info('The search function is disabled.');

    ELEM_ICON.style.display = 'none';
    return;
  }

  showSearch();

  ELEM_ICON.addEventListener(
    'click',
    () => {
      window.getComputedStyle(ELEM_WRAPPER).visibility === 'hidden' ? showSearch() : hiddenSearch();
    },
    { once: false, passive: true },
  );

  document.addEventListener(
    'keyup',
    e => {
      if (window.getComputedStyle(ELEM_WRAPPER).visibility === 'hidden') {
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

  rootPath = root;

  ELEM_ICON.addEventListener('click', initSearch, { once: true, passive: true });
  document.addEventListener('keyup', handleKeyup, { once: false, passive: true });
};

export const initGlobalSearch = () => {
  globalThis.search = globalThis.search || {};
  globalThis.search.hasFocus = () => ELEM_BAR === document.activeElement;
};
