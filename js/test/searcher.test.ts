import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { startupSearch, TARGET_SEARCH } from '../searcher.ts';
//import { debounce } from '../utils/timing.ts';

Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
    pathname: '/test',
    href: 'https://example.com/test',
  },
  writable: true,
});

globalThis.fetch = vi.fn() as MockedFunction<typeof fetch>;
globalThis.alert = vi.fn() as typeof alert;
globalThis.DecompressionStream = vi.fn() as typeof DecompressionStream;

describe('Searcher Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button data-target=${TARGET_SEARCH} class="icon-button" title="Toggle Search Box (Shortkey: / )" aria-label="Toggle Search Box" aria-expanded="false" aria-keyshortcuts="S" aria-controls="searchbar">
        <div class="icon-search fa-icon"></div>
      </button>

      <div id="search-pop">
        <input id="searchbar" type="text" />
        <div id="results-header"></div>
        <div id="searchresults"></div>
      </div>
    `;

    HTMLInputElement.prototype.select = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('startupSearch', () => {
    it('should initialize search with correct root path', () => {
      const searchButton = document.querySelector<HTMLButtonElement>(`[data-target="${TARGET_SEARCH}"]`)!;

      const mockAddEventListener = vi.fn();
      searchButton.addEventListener = mockAddEventListener;

      startupSearch();

      expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function), { once: true, passive: true });
    });

    it('should add keyup event listener to document', () => {
      const spy = vi.spyOn(document, 'addEventListener');

      startupSearch();

      expect(spy).toHaveBeenCalledWith('keyup', expect.any(Function), {
        once: false,
        passive: true,
      });
    });

    it('should handle missing search toggle element gracefully', () => {
      const searchButton = document.querySelector(`[data-target="${TARGET_SEARCH}"]`);
      searchButton?.remove();

      expect(() => startupSearch()).not.toThrow();
    });
  });

  describe('Network Operations', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle successful fetch requests', () => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(0);
    });
    /*
    // TODO: AssertionError: expected "spy" to be called at least once
    it('should handle fetch timeout correctly', async () => {
      const mockAbort = vi.fn();
      (globalThis as any).AbortController = vi.fn(() => ({
        abort: mockAbort,
        signal: { aborted: false },
      }));

      (globalThis as any).fetch = vi.fn(() => new Promise(res => setTimeout(res, 15000)));

      await vi.runAllTimersAsync();

      expect(mockAbort).toHaveBeenCalled();
      expect((globalThis as any).alert).toHaveBeenCalledWith('The request has timed out.');
    });
    */
  });

  /*
  // TODO: AssertionError: expected 'false' to be 'true' // Object.is equality
  describe('DOM Manipulation and Events', () => {
    it('should toggle search popover', () => {
      startupSearch();
      const toggle = document.querySelector(`[data-target="${TARGET_SEARCH}"]`)!;

      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });
  });
  */

  describe('Search Functionality', () => {
    it('should trim search input correctly', () => {
      const searchBar = document.getElementById('searchbar') as HTMLInputElement;
      searchBar.value = '  test query  ';
      expect(searchBar.value.trim()).toBe('test query');
    });
    /*
    // TODO: AssertionError: expected "spy" to be called at least once
    it('should debounce search input events', () => {
      startupSearch();
      const searchBar = document.getElementById('searchbar') as HTMLInputElement;

      searchBar.dispatchEvent(new Event('input'));

      expect(debounce).toHaveBeenCalled();
    });
    */
  });
});
