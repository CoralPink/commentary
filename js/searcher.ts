import { ROOT_PATH } from './constants.ts';
import { initMark, unmarking } from './mark.ts';
import { navigateTo } from './navigation.ts';

import { loadStyleSheet } from './utils/css-loader.ts';
import { fetchAndDecompress } from './utils/fetch.ts';
import { debounce } from './utils/timing.ts';

// deno-lint-ignore no-sloppy-imports
import initWasm, { Finder } from './wasm_book.js';
type SearchResult = {
  header: string;
  html: string | undefined;
};

const FILE_STYLE_SEARCH = 'css/search.css';
const FILE_INDEX = 'searchindex.json';

export const TARGET_SEARCH = 'search';

const DEBOUNCE_DELAY_MS = 80;

let elmPop: HTMLElement;
let elmSearchBar: HTMLInputElement;
let elmHeader: HTMLElement;
let elmResults: HTMLElement;

let finder: Finder;

let focusedLi: Element;

const showResults = (): void => {
  const result = finder.search(elmSearchBar.value.trim()) as SearchResult;

  elmHeader.textContent = result.header;
  elmResults.textContent = '';

  if (result.html !== undefined) {
    elmResults.insertAdjacentHTML('beforeend', result.html);
  }
};

const checkURL = (url: URL): boolean =>
  url.origin + url.pathname === globalThis.location.origin + globalThis.location.pathname;

const updateMark = (): void => {
  const element = document.getElementById('article');

  if (!element) {
    console.error(`updateMark: article element not found`);
    return;
  }
  initMark(element);
};

const jumpUrl = (): void => {
  const aElement = focusedLi?.querySelector('a') as HTMLAnchorElement;

  if (!aElement) {
    return;
  }

  const url = new URL(aElement.href);

  if (checkURL(url)) {
    unmarking();
    updateMark();
  }

  navigateTo(url);
  hiddenSearch();
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

  jumpUrl();
};

const searchMouseupHandler = (ev: MouseEvent): void => {
  const prevFocused = focusedLi;

  updateFocus(ev.target as HTMLElement);

  if (prevFocused !== focusedLi) {
    return;
  }

  jumpUrl();
};

const closedPopover = (ev: Event): void => {
  const customEvent = ev as CustomEvent;

  if (customEvent.detail?.newState === 'closed') {
    hiddenSearch();
  }
};

const debounceSearchInput = debounce((_: Event) => showResults(), DEBOUNCE_DELAY_MS);

const hiddenSearch = (): void => {
  elmPop.hidePopover();

  for (const x of Array.from(document.querySelectorAll(`[data-target="${TARGET_SEARCH}"]`))) {
    x.setAttribute('aria-expanded', 'false');
  }

  elmSearchBar.removeEventListener('input', debounceSearchInput);
  elmResults.removeEventListener('keyup', popupFocus);

  elmPop.removeEventListener('click', searchMouseupHandler);
  elmPop.removeEventListener('toggle', closedPopover);
};

const showSearch = (): void => {
  for (const x of Array.from(document.querySelectorAll(`[data-target="${TARGET_SEARCH}"]`))) {
    x.setAttribute('aria-expanded', 'true');
  }
  elmPop.showPopover();
  elmSearchBar.select();

  elmSearchBar.addEventListener('input', debounceSearchInput, {
    once: false,
    passive: true,
  });
  elmResults.addEventListener('keyup', popupFocus, {
    once: false,
    passive: true,
  });

  elmPop.addEventListener('click', searchMouseupHandler, {
    once: false,
    passive: true,
  });
  elmPop.addEventListener('toggle', closedPopover, {
    once: false,
    passive: true,
  });
};

const initSearch = async (): Promise<void> => {
  const cssPromise = loadStyleSheet(`${ROOT_PATH}${FILE_STYLE_SEARCH}`);

  const jsonPromise = fetchAndDecompress(`${ROOT_PATH}${FILE_INDEX}`);
  const wasmPromise = initWasm();

  document.removeEventListener('keyup', startSearchFromKey);

  const target = Array.from(document.querySelectorAll<HTMLElement>(`[data-target="${TARGET_SEARCH}"]`));

  for (const x of target) {
    x.removeEventListener('click', initSearch);
  }

  const elements = {
    pop: document.getElementById('search-pop'),
    searchBar: document.getElementById('searchbar'),
    header: document.getElementById('results-header'),
    results: document.getElementById('searchresults'),
  };

  if (!elements.pop || !elements.searchBar || !elements.header || !elements.results) {
    throw new Error('Required DOM elements not found');
  }

  if (!(elements.searchBar instanceof HTMLInputElement)) {
    throw new Error('searchbar element is not an input element');
  }

  elmPop = elements.pop;
  elmSearchBar = elements.searchBar;
  elmHeader = elements.header;
  elmResults = elements.results;

  for (const x of target) {
    x.addEventListener(
      'click',
      () => {
        if (!elmPop.checkVisibility()) {
          showSearch();
        }
      },
      { once: false, passive: true },
    );
  }

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

  try {
    const config = await jsonPromise;

    if (!config.doc_urls || !config.index.documentStore.docs) {
      throw new Error('Missing required search configuration fields');
    }

    await wasmPromise;
    finder = new Finder(ROOT_PATH, config.doc_urls, config.index.documentStore.docs);

    await cssPromise;
    showSearch();
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.info('The search function is disabled.');

    for (const x of target) {
      x.style.display = 'none';
    }

    alert('Search is currently unavailable.');
  }
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

export const startupSearch = (): void => {
  for (const x of Array.from(document.querySelectorAll(`[data-target="${TARGET_SEARCH}"]`))) {
    x.addEventListener('click', initSearch, { once: true, passive: true });
  }

  document.addEventListener('keyup', startSearchFromKey, {
    once: false,
    passive: true,
  });
};
