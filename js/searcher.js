import Finder from './finder.js';

import { tocReset } from './table-of-contents.js';
import { SearchResult, marking, unmarking } from './wasm_book.js';
import { loadStyleSheet } from './css-loader.js';

const STYLE_SEARCH = 'css/search.css';

const ID_ICON = 'search-toggle';
const ID_POP = 'search-pop';

const INITIAL_HEADER = '2文字 (もしくは全角1文字) 以上を入力してください...';

const FETCH_TIMEOUT = 10000;
const DEBOUNCE_DELAY_MS = 80;

let rootPath;

let elmSearchBar;
let elmHeader;
let elmResults;

let searchResult;
let finder;

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

  marking(escapeHtml(params));

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
    return;
  }

  if (li !== focusedLi) {
    focusedLi = li;
    return;
  }
  jumpUrl(li.querySelector('a'));
};

const isFullWidthOrAscii = s => {
  const code = s.charCodeAt(0);
  return code <= 127 || (code >= 0xff01 && code <= 0xff5e);
};

const showResults = () => {
  const terms = elmSearchBar.value.trim();
  elmResults.innerText = '';

  // If the input is less than one half-width character, the search process is not carried out.
  if (terms.length === 0 || (terms.length <= 1 && isFullWidthOrAscii(terms))) {
    elmHeader.innerText = INITIAL_HEADER;
    return;
  }

  const results = finder.search(terms);

  if (results.length === 0) {
    elmHeader.innerText = `No search result for : ${terms}`;
    return;
  }
  elmHeader.innerText = `${results.length} search results for : ${terms}`;
  searchResult.append_search_result(results, terms);
};

const searchHandler = fn => {
  let debounceTimer;

  return () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(), DEBOUNCE_DELAY_MS);
  };
};

const closedPopover = ev => {
  if (ev.newState === 'closed') {
    hiddenSearch();
  }
};

const hiddenSearch = () => {
  document.getElementById(ID_ICON).setAttribute('aria-expanded', 'false');

  elmSearchBar.removeEventListener('input', searchHandler(showResults));

  elmResults.removeEventListener('keyup', popupFocus);

  const pop = document.getElementById(ID_POP);
  pop.removeEventListener('click', searchMouseupHandler);
  pop.removeEventListener('toggle', closedPopover);
  pop.hidePopover();
};

const showSearch = () => {
  document.getElementById(ID_ICON).setAttribute('aria-expanded', 'true');

  showResults();

  elmSearchBar.addEventListener('input', searchHandler(showResults), { once: false, passive: true });

  elmResults.addEventListener('keyup', popupFocus, { once: false, passive: true });

  const pop = document.getElementById(ID_POP);
  pop.addEventListener('click', searchMouseupHandler, { once: false, passive: true });
  pop.addEventListener('toggle', closedPopover);
  pop.showPopover();

  elmSearchBar.focus();
  elmSearchBar.select();
};

const fetchRequest = async url => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    alert('The request has timed out.');
  }, FETCH_TIMEOUT);

  const response = await fetch(url, {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  return response;
};

const initSearch = async () => {
  document.removeEventListener('keyup', startSearchFromKey);

  const icon = document.getElementById(ID_ICON);
  icon.removeEventListener('click', initSearch);

  try {
    await loadStyleSheet(`${rootPath}${STYLE_SEARCH}`);

    const response = await fetchRequest(`${rootPath}searchindex.json`);
    const config = await response.json();

    searchResult = new SearchResult(rootPath, config.results_options.teaser_word_count, config.doc_urls);
    finder = new Finder(config.index.documentStore.docs, config.results_options.limit_results);
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.info('The search function is disabled.');

    icon.style.display = 'none';
    alert('Search is currently unavailable.');
    return;
  }

  elmSearchBar = document.getElementById('searchbar');
  elmHeader = document.getElementById('results-header');
  elmResults = document.getElementById('searchresults');

  showSearch();

  icon.addEventListener(
    'click',
    () => {
      document.getElementById(ID_POP).checkVisibility() ? hiddenSearch() : showSearch();
    },
    { once: false, passive: true },
  );

  document.addEventListener(
    'keyup',
    e => {
      switch (e.key) {
        case '/':
        case 's':
        case 'S':
          if (!document.getElementById(ID_POP).checkVisibility()) {
            showSearch();
          }
          break;

        case 'Escape':
          hiddenSearch();
          break;
      }
    },
    { once: false, passive: true },
  );
};

const startSearchFromKey = ev => {
  switch (ev.key) {
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

  document.getElementById(ID_ICON).addEventListener('click', initSearch, { once: true, passive: true });
  document.addEventListener('keyup', startSearchFromKey, { once: false, passive: true });
};
