import { debounce } from './timing';
import { tocReset } from './table-of-contents';
import { Finder, marking, unmarking } from './wasm_book';
import { loadStyleSheet } from './css-loader';

const STYLE_SEARCH = 'css/search.css';

const ID_ICON = 'search-toggle';

const FETCH_TIMEOUT = 10000;
const DEBOUNCE_DELAY_MS = 80;

let rootPath: string;

let elmPop: HTMLElement;
let elmSearchBar: HTMLInputElement;
let elmResults: HTMLElement;

let finder: Finder;

let focusedLi: Element;

class SearchNavigationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchNavigationError';
  }
}

const unmarkHandler = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    return;
  }

  for (const x of Array.from(article.querySelectorAll('mark'))) {
    x.removeEventListener('click', unmarkHandler);
  }
  unmarking();
  tocReset();
};

const escapeHtml = (str: string): string =>
  decodeURIComponent(str).replace(/[&<>"']/g, match => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    } as const;

    if (!map[match]) {
      throw new Error(`Unexpected character: ${match}`);
    }
    return map[match];
  });

// On reload or browser history backwards/forwards events, parse the url and do search or mark
const doSearchOrMarkFromUrl = (): void => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }

  marking(escapeHtml(params));

  const article = document.getElementById('article');

  if (article === null) {
    return;
  }

  for (const x of Array.from(article.querySelectorAll('mark'))) {
    x.addEventListener('click', unmarkHandler, { once: true, passive: true });
  }
};

const showResults = (): void => {
  elmResults.textContent = '';
  finder.search(elmSearchBar.value.trim());
};

const debounceSearchInput = debounce((_: Event) => showResults(), DEBOUNCE_DELAY_MS);

const jumpUrl = (): void => {
  const aElement = focusedLi?.querySelector('a') as HTMLAnchorElement;

  if (!aElement) {
    throw new SearchNavigationError('The link does not exist.');
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

const updateFocus = (target: HTMLElement): void => {
  const li = target.closest('li');

  if (!li || focusedLi === li) {
    return;
  }
  focusedLi?.removeAttribute('aria-selected');
  li.setAttribute('aria-selected', 'true');

  if (target.id) {
    elmPop.setAttribute('aria-activedescendant', target.id);
  }
  focusedLi = li;
};

const popupFocus = (ev: KeyboardEvent): void => {
  if (ev.key !== 'Enter') {
    updateFocus(ev.target as HTMLElement);
    return;
  }
  try {
    jumpUrl();
  } catch (error) {
    if (error instanceof SearchNavigationError) {
      console.warn('popupFocus - Navigation error:', error.message);
    }
  }
};

const searchMouseupHandler = (ev: MouseEvent): void => {
  const prevFocused = focusedLi;
  updateFocus(ev.target as HTMLElement);

  if (prevFocused !== focusedLi) {
    return;
  }

  try {
    jumpUrl();
  } catch (error) {
    if (error instanceof SearchNavigationError) {
      console.warn('searchMouseupHandler - Navigation error:', error.message);
    }
  }
};

const closedPopover = (ev: Event): void => {
  const customEvent = ev as CustomEvent;

  if (customEvent.detail?.newState === 'closed') {
    hiddenSearch();
  }
};

const hiddenSearch = (): void => {
  document.getElementById(ID_ICON)?.setAttribute('aria-expanded', 'false');

  elmSearchBar.removeEventListener('input', debounceSearchInput);
  elmResults.removeEventListener('keyup', popupFocus);

  elmPop.removeEventListener('click', searchMouseupHandler);
  elmPop.removeEventListener('toggle', closedPopover);

  elmPop.hidePopover();
};

const showSearch = (): void => {
  document.getElementById(ID_ICON)?.setAttribute('aria-expanded', 'true');

  elmSearchBar.addEventListener('input', debounceSearchInput, { once: false, passive: true });
  elmResults.addEventListener('keyup', popupFocus, { once: false, passive: true });

  elmPop.addEventListener('click', searchMouseupHandler, { once: false, passive: true });
  elmPop.addEventListener('toggle', closedPopover, { once: false, passive: true });

  elmPop.showPopover();

  elmSearchBar.focus();
  elmSearchBar.select();
};

const fetchRequest = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    alert('The request has timed out.');
  }, FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    return response;
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        console.error('Request timed out:', e.message);
      } else {
        console.error('Network error:', e.message);
      }
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};

const initSearch = async (): Promise<void> => {
  document.removeEventListener('keyup', startSearchFromKey);

  const icon = document.getElementById(ID_ICON);

  if (icon === null) {
    return;
  }

  icon.removeEventListener('click', initSearch);

  try {
    await loadStyleSheet(`${rootPath}${STYLE_SEARCH}`);

    const response = await fetchRequest(`${rootPath}searchindex.json`);
    const config = await response.json();

    if (!config.doc_urls || !config.index.documentStore.docs) {
      throw new Error('Missing required search configuration fields');
    }
    finder = new Finder(rootPath, config.doc_urls, config.index.documentStore.docs);
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.info('The search function is disabled.');

    icon.style.display = 'none';
    alert('Search is currently unavailable.');
    return;
  }

  const elements = {
    pop: document.getElementById('search-pop'),
    searchBar: document.getElementById('searchbar'),
    header: document.getElementById('results-header'),
    results: document.getElementById('searchresults'),
  };

  if (!elements.pop || !elements.searchBar || !elements.results) {
    throw new Error('Required DOM elements not found');
  }

  if (!(elements.searchBar instanceof HTMLInputElement)) {
    throw new Error('searchbar element is not an input element');
  }

  elmPop = elements.pop;
  elmSearchBar = elements.searchBar;
  elmResults = elements.results;

  showSearch();

  icon.addEventListener(
    'click',
    () => {
      elmPop.checkVisibility() ? hiddenSearch() : showSearch();
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
          if (!elmPop.checkVisibility()) {
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

const startSearchFromKey = (ev: KeyboardEvent): void => {
  switch (ev.key) {
    case '/':
    case 's':
    case 'S':
      initSearch();
      break;
  }
};

export const startupSearch = (root: string): void => {
  doSearchOrMarkFromUrl();

  rootPath = root;

  document.getElementById(ID_ICON)?.addEventListener('click', initSearch, { once: true, passive: true });
  document.addEventListener('keyup', startSearchFromKey, { once: false, passive: true });
};
