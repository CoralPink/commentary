import { debounce } from './timing';
import { Finder, marking, unmarking } from './wasm_book';
import { loadStyleSheet } from './css-loader';

type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw' | 'brotli';

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
    console.error('Article element not found');
    return;
  }

  for (const x of Array.from(article.querySelectorAll('mark'))) {
    x.removeEventListener('click', unmarkHandler);
  }
  unmarking(article);
};

// On reload or browser history backwards/forwards events, parse the url and do search or mark
const doSearchOrMarkFromUrl = (): void => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }

  const article = document.getElementById('article');

  if (article === null) {
    console.error('Article element not found');
    return;
  }

  marking(article, params);

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

/*
 * TODO:
 * Currently, Brotli can only be used with Safari 18.4 or later.
 *
 * It is possible that other browsers may support Brotli in the future,
 * in which case it should be rewritten to be more versatile!!
 */
const isUseBrotli = (): boolean => {
  const ua = navigator.userAgent;

  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  if (!isSafari) {
    return false;
  }

  const match = ua.match(/Version\/(\d+)\.(\d+)/);

  if (!match) {
    return false;
  }
  const [major, minor] = match.slice(1, 3).map(Number);
  return major > 18 || (major === 18 && minor >= 4);
};

const fetchAndDecompress = async (url: string) => {
  const isBrotli = isUseBrotli();
  const response = await fetchRequest(`${url}${isBrotli ? '.br' : '.gz'}`);

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const format: CompressionFormat = isBrotli ? 'brotli' : 'gzip';
  /* @ts-ignore */
  const stream = response.body.pipeThrough(new DecompressionStream(format));

  const decompressed = await new Response(stream).arrayBuffer();

  return JSON.parse(new TextDecoder().decode(decompressed));
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

    const config = await fetchAndDecompress(`${rootPath}searchindex.json`);

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
