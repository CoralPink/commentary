// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startupSearch } from '@/searcher.ts';

import { mockFinderConstruct, mockFinderSearch, mockInitWasm } from './mocks/wasm_book.ts';

const mocks = vi.hoisted(() => ({
  popoverOpen: false,

  loadStyleSheet: vi.fn<() => Promise<void>>(),
  fetchAndDecompress: vi.fn<() => Promise<ArrayBuffer>>(),

  resultsClear: vi.fn(),
  resultsUpdate: vi.fn(),
  focusFirstResult: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/constants.ts', () => ({
  ROOT_PATH: '/',
}));

vi.mock('@/searchHelper.ts', () => ({
  getSearchButton: () => document.querySelector('#search-btn'),
  getSearchPop: () => document.querySelector('#search-pop'),
  getSearchBar: () => document.querySelector('#searchbar'),
  isSearchPopoverOpen: () => mocks.popoverOpen,
  requireElement: (id: string) => document.getElementById(id),
}));

vi.mock('@/searchResults.ts', () => ({
  SearchResults: class extends HTMLElement {
    clear(): void {
      mocks.resultsClear();
    }

    update(html: string): void {
      mocks.resultsUpdate(html);
    }

    focusFirstResult(): void {
      mocks.focusFirstResult();
    }
  },
}));

vi.mock('@/utils/css-loader.ts', () => ({
  loadStyleSheet: mocks.loadStyleSheet,
}));

vi.mock('@/utils/fetch.ts', () => ({
  fetchAndDecompress: mocks.fetchAndDecompress,
}));

vi.mock('@/utils/input.ts', () => ({
  listenToInputEvents(
    input: HTMLInputElement,
    signal: AbortSignal,
    onInput: () => void,
    onKeydown: (event: KeyboardEvent) => void,
  ): void {
    input.addEventListener('input', onInput, { signal });
    input.addEventListener('keydown', onKeydown, { signal });
  },
}));

vi.mock('@/utils/toast.ts', () => ({
  default: {
    error: mocks.toastError,
  },
}));

const makeSearchResult = (header: string, html: string): Uint8Array => {
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(header);
  const htmlBytes = encoder.encode(html);
  const result = new Uint8Array(8 + headerBytes.length + htmlBytes.length);
  const view = new DataView(result.buffer);

  view.setUint32(0, headerBytes.length, true);
  view.setUint32(4, htmlBytes.length, true);
  result.set(headerBytes, 8);
  result.set(htmlBytes, 8 + headerBytes.length);

  return result;
};

describe('searcher', () => {
  beforeEach(() => {
    mocks.popoverOpen = false;

    mockInitWasm.mockReset().mockResolvedValue(undefined);
    mockFinderConstruct.mockReset();
    mockFinderSearch.mockReset();

    mocks.loadStyleSheet.mockReset().mockResolvedValue(undefined);
    mocks.fetchAndDecompress.mockReset();
    mocks.resultsClear.mockReset();
    mocks.resultsUpdate.mockReset();
    mocks.focusFirstResult.mockReset();
    mocks.toastError.mockReset();

    document.body.innerHTML = `
      <button type="button" data-target="search" id="search-btn" class="icon-button" title="Toggle Search Box (Shortkey: / )" aria-label="Toggle Search Box" aria-keyshortcuts="/" aria-controls="search-pop">
        <div class="icon-search fa-icon"></div>
      </button>

      <div popover id="search-pop">
        <input type="search" id="searchbar" name="searchbar" placeholder="Search this book ..." role="combobox"
          aria-label="Search this book" aria-expanded="false" aria-controls="results-body" aria-describedby="results-header">
        <div id="results-header" aria-live="polite"></div>
        <results-list id="results-body" role="listbox"></results-list>
      </div>
    `;

    const popover = document.querySelector<HTMLElement>('#search-pop')!;
    popover.showPopover = vi.fn(() => {
      mocks.popoverOpen = true;
    });
    popover.hidePopover = vi.fn(() => {
      mocks.popoverOpen = false;
    });

    const searchBar = document.querySelector<HTMLInputElement>('#searchbar')!;
    searchBar.select = vi.fn();

    const index = {
      doc_urls: ['/page.html'],
      index: {
        documentStore: {
          docs: { '0': { title: 'Page' } },
        },
      },
    };

    mocks.fetchAndDecompress.mockResolvedValue(new TextEncoder().encode(JSON.stringify(index)).buffer);

    mockFinderSearch.mockReturnValue(makeSearchResult('Search results', '<li>Result</li>'));
  });

  it('loads search, displays results, handles keys, and removes input listeners when closed', async () => {
    const button = document.querySelector<HTMLButtonElement>('#search-btn')!;
    const popover = document.querySelector<HTMLElement>('#search-pop')!;
    const searchBar = document.querySelector<HTMLInputElement>('#searchbar')!;
    const header = document.querySelector<HTMLDivElement>('#results-header')!;

    startupSearch();

    button.click();

    await vi.waitFor(() => {
      expect(popover.showPopover).toHaveBeenCalledOnce();
    });

    expect(mockInitWasm).toHaveBeenCalledOnce();
    expect(mockFinderConstruct).toHaveBeenCalledWith('/', ['/page.html'], { '0': { title: 'Page' } });
    expect(mocks.fetchAndDecompress).toHaveBeenCalledWith('/searchindex.json');
    expect(mocks.loadStyleSheet).toHaveBeenCalledWith('/css/search.css');
    expect(button.ariaExpanded).toBe('true');
    expect(searchBar.select).toHaveBeenCalledOnce();

    searchBar.value = 'query';
    searchBar.dispatchEvent(new Event('input'));

    expect(mockFinderSearch).toHaveBeenCalledWith('query');
    expect(header.textContent).toBe('Search results');
    expect(mocks.resultsUpdate).toHaveBeenCalledWith('<li>Result</li>');

    const keydown = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      cancelable: true,
    });
    searchBar.dispatchEvent(keydown);

    expect(keydown.defaultPrevented).toBe(true);
    expect(mocks.focusFirstResult).toHaveBeenCalledOnce();

    const searchCallsBeforeClose = mockFinderSearch.mock.calls.length;

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

    expect(popover.hidePopover).toHaveBeenCalledOnce();
    expect(button.ariaExpanded).toBe('false');

    searchBar.dispatchEvent(new Event('input'));
    expect(mockFinderSearch).toHaveBeenCalledTimes(searchCallsBeforeClose);
  });
});
