import { ROOT_PATH, USE_LEGACY_NAVIGATION } from './constants.ts';
import { marking } from './mark.ts';

import { loadStyleSheet } from './utils/css-loader.ts';
import { fetchAndDecompress } from './utils/fetch.ts';
import { setHTML } from './utils/html-sanitizer.ts';
import { debounce } from './utils/timing.ts';
import toast from './utils/toast.ts';

// deno-lint-ignore no-sloppy-imports
import initWasm, { Finder } from './wasm_book.js';

export const TARGET_SEARCH = 'search';

type SearchResponse = {
  id: number;
  page: string;
  head: string;
  breadcrumbs: string;
  score: number;
  excerpt: string;
};

const FILE_STYLE_SEARCH = 'css/search.css';
const FILE_INDEX = 'searchindex.json';

const DEBOUNCE_DELAY_MS = 80;

const SCORE_CHARACTER = '▰';
const SCORE_RATE = 16;
const SCORE_MAX_BAR = 640;

const INITIAL_HEADER = '2文字 (もしくは全角1文字) 以上を入力してください...';

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

const isSingleAsciiChar = (term: string): boolean => term.length === 1 && term.charCodeAt(0) <= 0x7f;

const createLinkElement = (item: SearchResponse, query: string): HTMLAnchorElement => {
  const a = document.createElement('a');

  a.href = `${ROOT_PATH}${item.page}?mark=${query}#${item.head}`;
  a.tabIndex = -1;

  setHTML(a, item.breadcrumbs);

  return a;
};

const createSpanElement = (item: SearchResponse): HTMLSpanElement => {
  const span = document.createElement('span');

  span.setAttribute('aria-hidden', 'true');

  setHTML(span, item.excerpt);

  return span;
};

const scoringNotation = (score: number): string => {
  const bar = SCORE_CHARACTER.repeat(Math.floor(Math.min(score, SCORE_MAX_BAR) / SCORE_RATE));
  return `${bar} (${score}pt)`;
};

const createScoreElement = (item: SearchResponse): HTMLDivElement => {
  const score = document.createElement('div');

  score.id = 'score';
  score.setAttribute('role', 'meter');
  score.setAttribute('aria-label', `score:${item.score}pt`);

  setHTML(score, scoringNotation(item.score));

  return score;
};

const createList = (term: string, results: SearchResponse[]): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  const queryMark = encodeURIComponent(term);

  for (const item of results) {
    const li = document.createElement('li');

    li.id = `s${item.id}`;
    li.tabIndex = 0;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-label', `${item.page} ${item.score}pt`);

    li.appendChild(createLinkElement(item, queryMark));
    li.appendChild(createSpanElement(item));
    li.appendChild(createScoreElement(item));

    fragment.appendChild(li);
  }

  return fragment;
};

const showResults = (): void => {
  const term = elmSearchBar.value;

  if (isSingleAsciiChar(term)) {
    setHTML(elmHeader, INITIAL_HEADER);
    elmResults.replaceChildren();
    return;
  }

  const results = finder.search(term);

  if (results === null) {
    setHTML(elmHeader, `No search result for : ${term}`);
    elmResults.replaceChildren();
    return;
  }

  setHTML(elmHeader, `${results.length} search results for : ${term}`);

  elmResults.replaceChildren(createList(term, results));
  marking(elmResults, term, false);
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

const jumpUrl = (): void => {
  const aElement = focusedLi?.querySelector('a') as HTMLAnchorElement;

  if (!aElement) {
    return;
  }

  navigateInternal(new URL(aElement.href));

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
    finder = new Finder(data.doc_urls, data.index.documentStore.docs);

    await cssPromise;
    showSearch();
  } catch (e: unknown) {
    console.error(`Error during initialization: ${e}`);

    for (const x of elmSearch) {
      x.style.display = 'none';
    }

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
  elmSearch = Array.from(document.querySelectorAll(`[data-target="${TARGET_SEARCH}"]`));

  for (const x of elmSearch) {
    x.addEventListener('click', bootSearch, { once: true, passive: true });
  }

  document.addEventListener('keyup', bootSearchFromKey, {
    once: false,
    passive: true,
  });
};
