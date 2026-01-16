import { ROOT_PATH, USE_LEGACY_NAVIGATION } from './constants.ts';
import { initMark, unmarking } from './mark.ts';

import { loadStyleSheet } from './utils/css-loader.ts';
import { fetchAndDecompress } from './utils/fetch.ts';
import { setHTML } from './utils/html-sanitizer.ts';
import { debounce } from './utils/timing.ts';

// deno-lint-ignore no-sloppy-imports
import initWasm, { Finder } from './wasm_book.js';

export const TARGET_SEARCH = 'search';

type SearchResult = {
  header: string;
  html: string | undefined;
};

const FILE_STYLE_SEARCH = 'css/search.css';
const FILE_INDEX = 'searchindex.json';

const DEBOUNCE_DELAY_MS = 80;

let elmSearch: HTMLElement[];
let elmPop: HTMLElement;
let elmSearchBar: HTMLInputElement;
let elmHeader: HTMLElement;
let elmResults: HTMLElement;

let finder: Finder;

let focusedLi: Element | null;

// TODO: After Firefox 147 is released, delete it at an appropriate time!!
const navigateInternal: (url: URL) => void = USE_LEGACY_NAVIGATION
  ? (url: URL): void => {
      document.dispatchEvent(
        new CustomEvent('jump_internal', {
          bubbles: true,
          detail: { url },
        }),
      );
    }
  : (url: URL): void => {
      // @ts-expect-error: deno-ts does not yet recognize the Navigation API.
      navigation.navigate(url);
    };

const showResults = (): void => {
  const result = finder.search(elmSearchBar.value.trim()) as SearchResult;

  elmHeader.textContent = result.header;

  if (result.html === undefined) {
    elmResults.textContent = '';
    return;
  }

  setHTML(elmResults, result.html);
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

  navigateInternal(url);

  requestAnimationFrame(() => {
    hiddenSearch();
  });
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

  for (const x of elmSearch) {
    x.setAttribute('aria-expanded', 'false');
  }

  elmSearchBar.removeEventListener('input', debounceSearchInput);
  elmResults.removeEventListener('keyup', popupFocus);

  elmPop.removeEventListener('click', searchMouseupHandler);
  elmPop.removeEventListener('toggle', closedPopover);
};

const showSearch = (): void => {
  if (elmPop.checkVisibility()) {
    return;
  }

  for (const x of elmSearch) {
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

const startSearchfromKey = (ev: KeyboardEvent): void => {
  switch (ev.key) {
    case '/':
    case 's':
    case 'S':
      showSearch();
      break;

    case 'Escape':
      hiddenSearch();
      break;
  }
};

const bootSearch = async (): Promise<void> => {
  const cssPromise = loadStyleSheet(`${ROOT_PATH}${FILE_STYLE_SEARCH}`);
  const jsonPromise = fetchAndDecompress(`${ROOT_PATH}${FILE_INDEX}`);

  const wasmPromise = initWasm();

  document.removeEventListener('keyup', bootSearchFromKey);

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

  for (const x of elmSearch) {
    x.removeEventListener('click', bootSearch);
    x.addEventListener('click', showSearch, { once: false, passive: true });
  }

  document.addEventListener('keyup', startSearchfromKey, {
    once: false,
    passive: true,
  });

  try {
    const buf = await jsonPromise;
    const data = JSON.parse(new TextDecoder().decode(buf));

    if (!data.doc_urls || !data.index.documentStore.docs) {
      throw new Error('Missing required search data fields');
    }

    await wasmPromise;
    finder = new Finder(ROOT_PATH, data.doc_urls, data.index.documentStore.docs);

    await cssPromise;
    showSearch();
  } catch (e: unknown) {
    console.error(`Error during initialization: ${e}`);
    console.info('The search function is disabled.');

    for (const x of elmSearch) {
      x.style.display = 'none';
    }

    alert('Search is currently unavailable.');
  }
};

const bootSearchFromKey = (ev: KeyboardEvent): void => {
  switch (ev.key) {
    case '/':
    case 's':
    case 'S':
      bootSearch();
      break;
  }
};

export const startupSearch = (): void => {
  elmSearch = Array.from(document.querySelectorAll(`[data-target="${TARGET_SEARCH}"]`));

  for (const x of elmSearch) {
    x.addEventListener('click', bootSearch, { once: true, passive: true });
  }

  document.addEventListener('keyup', bootSearchFromKey, {
    once: false,
    passive: true,
  });
};
