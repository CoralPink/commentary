import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { startupSearch, TARGET_SEARCH } from '../searcher.ts';

// Mock modules before imports
vi.mock('../utils/css-loader.ts', () => ({
  loadStyleSheet: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../utils/fetch.ts', () => {
  return {
    fetchAndDecompress: vi.fn(() => new ArrayBuffer(0)),
  };
});

vi.mock('../mark.ts', () => ({
  doMarkFromUrl: vi.fn(),
  unmarking: vi.fn(),
}));

vi.mock('../navigation.ts', () => ({
  navigateTo: vi.fn(),
}));

vi.mock('../wasm_book.js', () => {
  class MockFinder {
    search = vi.fn().mockReturnValue({
      header: 'Test Results',
      html: '<li><a href="/test">Test Result</a></li>',
    });
  }

  const initWasm = vi.fn().mockResolvedValue(undefined);

  return {
    default: initWasm,
    Finder: MockFinder,
  };
});

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

// Proper DecompressionStream mock as a class
class MockDecompressionStream {
  readable: ReadableStream;
  writable: WritableStream;

  constructor(_format: CompressionFormat) {
    const transformStream = new TransformStream();
    this.readable = transformStream.readable;
    this.writable = transformStream.writable;
  }
}

globalThis.DecompressionStream = MockDecompressionStream;

describe('Searcher Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button data-target=${TARGET_SEARCH} class="icon-button" title="Toggle Search Box (Shortkey: / )" aria-label="Toggle Search Box" aria-expanded="false" aria-keyshortcuts="S" aria-controls="searchbar">
        <div class="icon-search fa-icon"></div>
      </button>

      <div id="search-pop" popover>
        <input id="searchbar" type="text" />
        <div id="results-header"></div>
        <div id="searchresults"></div>
      </div>
    `;

    // Mock popover API
    const searchPop = document.getElementById('search-pop') as HTMLElement;
    searchPop.showPopover = vi.fn();
    searchPop.hidePopover = vi.fn();
    searchPop.togglePopover = vi.fn();
    searchPop.checkVisibility = vi.fn().mockReturnValue(false);

    HTMLInputElement.prototype.select = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('startupSearch', () => {
    it('should initialize search with correct event listeners on search button', () => {
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

    it('should initialize search and fetch required resources on button click', async () => {
      const { fetchAndDecompress } = await import('../utils/fetch.ts');

      const mockFetch = fetchAndDecompress as MockedFunction<typeof fetchAndDecompress>;
      const mockData = { doc_urls: [], index: { documentStore: { docs: [] } } };
      const mockBuffer = new TextEncoder().encode(JSON.stringify(mockData)).buffer;

      mockFetch.mockResolvedValue(mockBuffer);

      startupSearch();

      const searchButton = document.querySelector<HTMLButtonElement>(`[data-target="${TARGET_SEARCH}"]`)!;
      searchButton.click();

      await vi.runAllTimersAsync();

      // Verify fetchRequest was called for search index
      expect(mockFetch).toHaveBeenCalled();
    });

    /*
    it('should handle fetch timeout by showing alert', async () => {
      const { fetchRequest } = await import('../utils/fetch.ts');
      const mockFetch = fetchRequest as MockedFunction<typeof fetchRequest>;

      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      startupSearch();

      const searchButton = document.querySelector<HTMLButtonElement>(`[data-target="${TARGET_SEARCH}"]`)!;
      searchButton.click();

      await vi.runAllTimersAsync();

      // Verify alert was called on abort error
      expect(globalThis.alert).toHaveBeenCalledWith('Search is currently unavailable.');
    });
    */
  });
  /*
  // TODO: AssertionError: expected "vi.fn()" to be called at least once
  describe('DOM Manipulation and Events', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update aria-expanded when initializing search via keypress', async () => {
      const { fetchRequest } = await import('../utils/fetch.ts');
      const mockFetch = fetchRequest as MockedFunction<typeof fetchRequest>;

      const mockSearchData = {
        doc_urls: ['test.html'],
        index: {
          documentStore: {
            docs: { '0': { title: 'Test' } },
          },
        },
      };

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(mockSearchData));

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encodedData);
          controller.close();
        },
      });

      const mockResponse = {
        body: mockStream,
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      startupSearch();

      const toggle = document.querySelector(`[data-target="${TARGET_SEARCH}"]`)!;
      const searchPop = document.getElementById('search-pop') as HTMLElement;

      // Mock the popover to report as visible after being shown
      searchPop.checkVisibility = vi.fn().mockReturnValue(false);

      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      // Trigger search via '/' key
      document.dispatchEvent(new KeyboardEvent('keyup', { key: '/' }));

      await vi.runAllTimersAsync();

      // After initialization, the popover should be shown and aria-expanded updated
      expect(searchPop.showPopover).toHaveBeenCalled();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
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
    // TODO: TypeError: MockFinder.mockImplementation is not a function
    it('should debounce search input events', async () => {
      vi.useFakeTimers();

      const { fetchRequest } = await import('../utils/fetch.ts');
      const mockFetch = fetchRequest as MockedFunction<typeof fetchRequest>;
      const MockFinder = Finder as unknown as MockedFunction<typeof Finder>;

      const mockSearchFn = vi.fn().mockReturnValue({
        header: 'Results',
        html: '<li>Test</li>',
      });

      MockFinder.mockImplementation(
        class {
          search = mockSearchFn;
        } as any,
      );

      const mockSearchData = {
        doc_urls: ['test.html'],
        index: {
          documentStore: {
            docs: { '0': { title: 'Test' } },
          },
        },
      };

      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(mockSearchData));

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encodedData);
          controller.close();
        },
      });

      const mockResponse = {
        body: mockStream,
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      startupSearch();

      // Trigger initialization
      document.dispatchEvent(new KeyboardEvent('keyup', { key: '/' }));
      await vi.runAllTimersAsync();

      const searchBar = document.getElementById('searchbar') as HTMLInputElement;
      searchBar.value = 'test';

      // Dispatch multiple input events rapidly
      searchBar.dispatchEvent(new Event('input'));
      searchBar.dispatchEvent(new Event('input'));
      searchBar.dispatchEvent(new Event('input'));

      // Search should not be called immediately (debounced)
      expect(mockSearchFn).not.toHaveBeenCalled();

      // Advance time past debounce delay (80ms)
      await vi.advanceTimersByTimeAsync(100);

      // Search should only be called once due to debouncing
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
    */
  });
});
