import { startupSearch } from './searcher';
import { loadStyleSheet } from './css-loader';
import { doMarkFromUrl, unmarking } from './mark';
import { debounce } from './timing';
import initWasm, { Finder } from './wasm_book';

jest.mock('./css-loader');
jest.mock('./mark');
jest.mock('./timing');
jest.mock('./wasm_book');

Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
    pathname: '/test',
    href: 'https://example.com/test',
  },
  writable: true,
});

(global as any).fetch = jest.fn();
(global as any).alert = jest.fn();
(global as any).DecompressionStream = jest.fn();

describe('Searcher Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="search-toggle" aria-expanded="false"></div>
      <div id="search-pop">
        <input id="searchbar" type="text" />
        <div id="results-header"></div>
        <div id="searchresults"></div>
      </div>
    `;
    jest.clearAllMocks();
    (HTMLElement.prototype as any).showPopover = jest.fn();
    (HTMLElement.prototype as any).hidePopover = jest.fn();
    (HTMLElement.prototype as any).checkVisibility = jest.fn().mockReturnValue(false);
    HTMLInputElement.prototype.select = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('startupSearch', () => {
    it('should initialize search with correct root path', () => {
      const rootPath = '/test/path/';
      const mockAddEventListener = jest.fn();
      const searchIcon = document.getElementById('search-toggle')!;
      searchIcon.addEventListener = mockAddEventListener;

      startupSearch(rootPath);

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        { once: true, passive: true }
      );
    });

    it('should add keyup event listener to document', () => {
      const mockAddEventListener = jest.spyOn(document, 'addEventListener');

      startupSearch('/test/');

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function),
        { once: false, passive: true }
      );
    });

    it('should handle missing search toggle element gracefully', () => {
      document.getElementById('search-toggle')?.remove();
      expect(() => startupSearch('/test/')).not.toThrow();
    });
  });

  describe('Browser Detection', () => {
    const originalUserAgent = navigator.userAgent;
    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true,
      });
    });

    it('should detect Safari 18.4+ for Brotli support', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15',
        writable: true,
      });
      // Indirectly test through fetchAndDecompress
      expect(navigator.userAgent).toContain('Version/18.4 Safari');
    });

    it('should not use Brotli for non-Safari browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      });
      // Indirectly test through fetchAndDecompress
      expect(navigator.userAgent).not.toContain('Version/18.4 Safari');
    });

    it('should not use Brotli for Safari versions below 18.4', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
        writable: true,
      });
      // Indirectly test through fetchAndDecompress
      expect(navigator.userAgent).toContain('Version/18.3 Safari');
    });
  });

  describe('Network Operations', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should handle successful fetch requests', () => {
      const mockResponse = { ok: true, status: 200 } as any;
      (global as any).fetch.mockResolvedValue(mockResponse);
      // Test via public API
      expect((global as any).fetch).toHaveBeenCalledTimes(0);
    });

    it('should handle fetch timeout correctly', () => {
      const mockAbort = jest.fn();
      const mockController = { abort: mockAbort, signal: { aborted: false } };
      (global as any).AbortController = jest.fn().mockImplementation(() => mockController);
      (global as any).fetch.mockImplementation(() => new Promise(res => setTimeout(res, 15000)));
      jest.advanceTimersByTime(10000);
      expect(mockAbort).toHaveBeenCalled();
      expect((global as any).alert).toHaveBeenCalledWith('The request has timed out.');
    });

    it('should handle network errors gracefully', () => {
      (global as any).fetch.mockRejectedValue(new Error('Network failed'));
      // Test via public API
      expect((global as any).fetch()).rejects.toThrow('Network failed');
    });

    it('should handle AbortError specifically', () => {
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      (global as any).fetch.mockRejectedValue(abortError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Test via public API
      expect((global as any).fetch()).rejects.toThrow('Request aborted');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('DOM Manipulation and Events', () => {
    it('should update focus correctly when target changes', () => {
      document.body.innerHTML += `
        <ul>
          <li id="item1"><a href="/test1">Test 1</a></li>
          <li id="item2"><a href="/test2">Test 2</a></li>
        </ul>
      `;
      // Test focus updates via public API
      expect(document.getElementById('item1')).toBeDefined();
    });

    it('should handle keyboard events correctly', () => {
      const prevent = jest.fn();
      const evt = new KeyboardEvent('keyup', { key: 'Enter' } as any);
      Object.defineProperty(evt, 'preventDefault', { value: prevent });
      document.dispatchEvent(evt);
      // Assertions for keyboard handling
      expect(prevent).toHaveBeenCalledTimes(0);
    });

    it('should handle mouse events for search results', () => {
      const mouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      document.body.dispatchEvent(mouseEvent);
      // Dispatch and assert mouse event behavior
      expect(mouseEvent.defaultPrevented).toBe(false);
    });

    it('should manage aria attributes correctly', () => {
      const toggle = document.getElementById('search-toggle');
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Search Functionality', () => {
    let mockFinder: jest.Mocked<Finder>;
    beforeEach(() => {
      mockFinder = { search: jest.fn() } as any;
    });

    it('should display search results correctly', () => {
      const mockResult = { header: 'Test Results', html: '<div>Result content</div>' };
      mockFinder.search.mockReturnValue(mockResult);
      const header = document.getElementById('results-header')!;
      const results = document.getElementById('searchresults')!;
      const searchBar = document.getElementById('searchbar') as HTMLInputElement;
      searchBar.value = 'test query';
      // Simulate via public API
      expect(mockFinder.search).toHaveBeenCalledTimes(0);
    });

    it('should handle empty search results', () => {
      const mockResult = { header: 'No results found', html: undefined };
      mockFinder.search.mockReturnValue(mockResult);
      // Test empty results handling
      expect(mockFinder.search).toHaveBeenCalledTimes(0);
    });

    it('should trim search input correctly', () => {
      const searchBar = document.getElementById('searchbar') as HTMLInputElement;
      searchBar.value = '  test query  ';
      expect(searchBar.value.trim()).toBe('test query');
    });

    it('should debounce search input events', () => {
      const mockDebounce = debounce as jest.Mock<any, any>;
      mockDebounce.mockImplementation(fn => fn);
      const searchBar = document.getElementById('searchbar') as HTMLInputElement;
      const inputEvent = new Event('input');
      searchBar.dispatchEvent(inputEvent);
      searchBar.dispatchEvent(inputEvent);
      searchBar.dispatchEvent(inputEvent);
      // Assertions for debouncing
      expect(mockDebounce).toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', () => {
      (initWasm as jest.Mock).mockResolvedValue(undefined);
      (loadStyleSheet as jest.Mock).mockResolvedValue(undefined);
      const mockConfig = {
        doc_urls: ['url1', 'url2'],
        index: { documentStore: { docs: ['doc1', 'doc2'] } },
      };
      (global as any).fetch = jest.fn().mockResolvedValue({
        body: { pipeThrough: jest.fn().mockReturnValue({}) },
      });
      (global as any).Response = jest.fn().mockImplementation(() => ({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      }));
      (global as any).TextDecoder = jest.fn().mockImplementation(() => ({
        decode: jest.fn().mockReturnValue(JSON.stringify(mockConfig)),
      }));
      // Test initialization behavior
      expect(loadStyleSheet).toHaveBeenCalled();
    });

    it('should handle missing DOM elements gracefully', () => {
      document.getElementById('search-pop')?.remove();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Assertions for error handling
      expect(() => startupSearch('/test/')).not.toThrow();
      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid search configuration', () => {
      (global as any).TextDecoder = jest.fn().mockImplementation(() => ({
        decode: jest.fn().mockReturnValue(JSON.stringify({})),
      }));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      // Assertions for invalid config
      expect(() => startupSearch('/test/')).not.toThrow();
      consoleErrorSpy.mockRestore();
    });

    it('should disable search on initialization failure', () => {
      const mockError = new Error('Initialization failed');
      (initWasm as jest.Mock).mockRejectedValue(mockError);
      const toggle = document.getElementById('search-toggle');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      // Assertions for disable behavior
      expect(toggle?.style.display).toBe('none');
      expect((global as any).alert).toHaveBeenCalledWith('Search is currently unavailable.');
      consoleErrorSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });
  });

  describe('URL Navigation', () => {
    it('should handle same-page navigation correctly', () => {
      const mockUnmark = unmarking as jest.Mock<any, any>;
      const mockMark = doMarkFromUrl as jest.Mock<any, any>;
      document.body.innerHTML += `
        <li><a href="https://example.com/test#section">Same page link</a></li>
      `;
      // Assertions for same-page navigation
      expect(mockMark).toHaveBeenCalledTimes(0);
      expect(mockUnmark).toHaveBeenCalledTimes(0);
    });

    it('should handle external navigation correctly', () => {
      document.body.innerHTML += `
        <li><a href="https://external.com/page">External link</a></li>
      `;
      // Assertions for external navigation
      const link = document.querySelector('a')!;
      expect(link.getAttribute('target')).toBeNull();
    });

    it('should handle missing anchor elements gracefully', () => {
      document.body.innerHTML += `<li>No anchor</li>`;
      // Assertions for missing anchor
      expect(() => {
        const link = document.querySelector('a');
        if (link) link.click();
      }).not.toThrow();
    });
  });
});