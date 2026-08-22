import { ROOT_PATH } from './constants.ts';
import { getSearchButton, getSearchPop, isSearchPopoverOpen } from './searchHelper.ts';
import { SearchResult } from './searchResult.ts';

import { loadStyleSheet } from './utils/css-loader.ts';
import { fetchAndDecompress } from './utils/fetch.ts';
import { setHTML } from './utils/html-sanitizer.ts';
import { debounce } from './utils/timing.ts';
import toast from './utils/toast.ts';

// deno-lint-ignore no-sloppy-imports
import initWasm, { Finder } from './wasm_book.js';

const FILE_STYLE_SEARCH = 'css/search.css';
const FILE_INDEX = 'searchindex.json';

const DEBOUNCE_DELAY_MS = 80;

const LENGTH_FIELD_SIZE = 4; // 4byte: Uint32

const RESULT_HEADER_LEN_POSITION = 0;
const RESULT_HTML_LEN_POSITION = LENGTH_FIELD_SIZE * 1;
const RESULT_DATA_START = LENGTH_FIELD_SIZE * 2;

let elmSearchBar: HTMLInputElement;
let elmHeader: HTMLElement;
let elmResults: HTMLElement;

let finder: Finder;
let searchAbort: AbortController | null = null;

const showResults = (): void => {
  const bytes = finder.search(elmSearchBar.value);
  const dv = new DataView(bytes.buffer);

  const headerLen = dv.getUint32(RESULT_HEADER_LEN_POSITION, true);
  const htmlLen = dv.getUint32(RESULT_HTML_LEN_POSITION, true);

  elmHeader.textContent = new TextDecoder().decode(bytes.subarray(RESULT_DATA_START, RESULT_DATA_START + headerLen));

  if (htmlLen === 0) {
    elmResults.textContent = '';
    return;
  }

  const htmlStart = RESULT_DATA_START + headerLen;
  const htmlEnd = htmlStart + htmlLen;

  setHTML(elmResults, new TextDecoder().decode(bytes.subarray(htmlStart, htmlEnd)));
};

export const hiddenSearch = (): void => {
  getSearchPop()?.hidePopover();
  getSearchButton()!.ariaExpanded = 'false';

  if (searchAbort === null) {
    return;
  }
  searchAbort.abort();
  searchAbort = null;
};

const closedPopover = (ev: Event): void => {
  const customEvent = ev as CustomEvent;

  if (customEvent.detail?.newState === 'closed') {
    hiddenSearch();
  }
};

const debounceSearchInput = debounce((_: Event) => showResults(), DEBOUNCE_DELAY_MS);

const searchbarKeydown = (ev: KeyboardEvent): void => {
  if (ev.key !== 'ArrowDown') {
    return;
  }

  const result = elmResults.querySelector('search-result');

  if (!(result instanceof SearchResult)) {
    return;
  }

  ev.preventDefault();
  result.focusAndSelect();
};

const showSearch = (): void => {
  if (isSearchPopoverOpen()) {
    return;
  }

  getSearchButton()!.ariaExpanded = 'true';

  const elmPop = getSearchPop();

  if (elmPop === null) {
    console.error('searcher: popup element not found');
    return;
  }
  elmPop.showPopover();
  elmSearchBar.select();

  searchAbort = new AbortController();
  const signal = searchAbort.signal;

  elmSearchBar.addEventListener('input', debounceSearchInput, {
    passive: true,
    signal,
  });

  elmSearchBar.addEventListener('keydown', searchbarKeydown, {
    passive: false,
    signal,
  });

  elmPop.addEventListener('toggle', closedPopover, {
    passive: true,
    signal,
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
    searchBar: document.getElementById('searchbar'),
    header: document.getElementById('results-header'),
    results: document.getElementById('searchresults'),
    button: getSearchButton(),
  };

  if (
    elements.searchBar === null ||
    elements.header === null ||
    elements.results === null ||
    elements.button === null
  ) {
    throw new Error('Required DOM elements not found');
  }

  if (!(elements.searchBar instanceof HTMLInputElement)) {
    throw new Error('searchbar element is not an input element');
  }

  elmSearchBar = elements.searchBar;
  elmHeader = elements.header;
  elmResults = elements.results;

  elements.button.removeEventListener('click', bootSearch);
  elements.button.addEventListener('click', showSearch, {
    passive: true,
  });

  document.addEventListener('keyup', startSearchfromKey, {
    passive: true,
  });

  try {
    const buf = await jsonPromise;
    const data = JSON.parse(new TextDecoder().decode(buf));

    if (!data.doc_urls || !data.index.documentStore.docs) {
      throw new Error('Missing required search data fields');
    }

    customElements.define('search-result', SearchResult);

    await wasmPromise;
    finder = new Finder(ROOT_PATH, data.doc_urls, data.index.documentStore.docs);

    await cssPromise;
    showSearch();
  } catch (e: unknown) {
    elements.button.style.display = 'none';

    console.error(`Error during initialization: ${e}`);
    toast.error('Search is currently unavailable.');
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
  const button = getSearchButton();

  if (button === null) {
    toast.error('Search is currently unavailable.');
    return;
  }

  button.addEventListener('click', bootSearch, {
    once: true,
    passive: true,
  });

  document.addEventListener('keyup', bootSearchFromKey, {
    passive: true,
  });
};
