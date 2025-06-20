/**
 * @file sidebar.test.ts
 * @description Unit tests for the sidebar module, using Jest to mock dependencies,
 * DOM APIs, and global functions. Covers initialization, content loading, event
 * handling, responsive behavior, state persistence, accessibility, URL handling,
 * and error edge cases.
 */

import { initSidebar } from '../git/js/sidebar';
import { writeLocalStorage } from '../git/js/storage';
import { getRootVariableNum, loadStyleSheet } from '../git/js/css-loader';

jest.mock('../git/js/storage');
jest.mock('../git/js/css-loader');

const mockWriteLocalStorage = writeLocalStorage as jest.MockedFunction<typeof writeLocalStorage>;
const mockGetRootVariableNum = getRootVariableNum as jest.MockedFunction<typeof getRootVariableNum>;
const mockLoadStyleSheet = loadStyleSheet as jest.MockedFunction<typeof loadStyleSheet>;

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

/**
 * Creates a mock HTMLElement with basic DOM API stubs.
 */
function createMockElement(
  id: string,
  tag: string = 'div'
): HTMLElement & {
  checkVisibility: jest.Mock;
  classList: { add: jest.Mock; remove: jest.Mock; contains: jest.Mock; toggle: jest.Mock };
  insertAdjacentHTML: jest.Mock;
  scrollIntoView: jest.Mock;
  querySelectorAll: jest.Mock;
} {
  const element = document.createElement(tag) as any;
  element.id = id;
  element.checkVisibility = jest.fn().mockReturnValue(false);
  element.getAttribute = jest.fn();
  element.setAttribute = jest.fn();
  element.removeAttribute = jest.fn();
  element.addEventListener = jest.fn();
  element.removeEventListener = jest.fn();
  element.classList = {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    toggle: jest.fn(),
  };
  element.style = {} as CSSStyleDeclaration;
  element.insertAdjacentHTML = jest.fn();
  element.scrollIntoView = jest.fn();
  element.querySelectorAll = jest.fn().mockReturnValue([]);
  return element;
}

describe('Sidebar Module', () => {
  let mockSidebar: ReturnType<typeof createMockElement>;
  let mockPage: ReturnType<typeof createMockElement>;
  let mockToggleButton: ReturnType<typeof createMockElement>;
  let mockScrollbox: ReturnType<typeof createMockElement>;
  let mockMain: ReturnType<typeof createMockElement>;
  let mockSearchPop: ReturnType<typeof createMockElement>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock elements
    mockSidebar = createMockElement('sidebar');
    mockPage = createMockElement('page');
    mockToggleButton = createMockElement('sidebar-toggle', 'button');
    mockScrollbox = createMockElement('sidebar-scrollbox');
    mockMain = createMockElement('main');
    mockSearchPop = createMockElement('search-pop');

    // Mock document.getElementById
    jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      const map: Record<string, HTMLElement> = {
        sidebar: mockSidebar,
        page: mockPage,
        'sidebar-toggle': mockToggleButton,
        'sidebar-scrollbox': mockScrollbox,
        main: mockMain,
        'search-pop': mockSearchPop,
      };
      return map[id] || null;
    });

    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();

    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://example.com/test/page.html' },
    });

    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initSidebar', () => {
    it('should initialize sidebar with default visible state on desktop', () => {
      mockGetRootVariableNum.mockReturnValue(768);
      Object.defineProperty(window, 'innerWidth', { value: 1024 });

      initSidebar('/test/');

      expect(mockGetRootVariableNum).toHaveBeenCalledWith('--mobile-max-width');
      expect(mockPage.classList.add).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('block');
      expect(mockToggleButton.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
    });

    it('should initialize sidebar as hidden on mobile devices', () => {
      mockGetRootVariableNum.mockReturnValue(768);
      Object.defineProperty(window, 'innerWidth', { value: 600 });

      initSidebar('/test/');

      expect(mockPage.classList.remove).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('none');
      expect(mockSidebar.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
      expect(mockToggleButton.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should respect localStorage hidden state', () => {
      mockGetRootVariableNum.mockReturnValue(768);
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      localStorageMock.getItem.mockReturnValue('hidden');

      initSidebar('/test/');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('mdbook-sidebar');
      expect(mockSidebar.style.display).toBe('none');
      expect(mockWriteLocalStorage).not.toHaveBeenCalled();
    });

    it('should handle CSS variable loading errors gracefully', () => {
      mockGetRootVariableNum.mockImplementation(() => {
        throw new Error('CSS variable not found');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      initSidebar('/test/');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load "mobile-max-width"');
      expect(mockSidebar.style.display).toBe('none');
      consoleSpy.mockRestore();
    });

    it('should set up keyboard event listeners', () => {
      mockGetRootVariableNum.mockReturnValue(768);

      initSidebar('/test/');

      expect(document.addEventListener).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function),
        { once: false, passive: true }
      );
    });

    it('should set up media query listener for responsive behavior', () => {
      mockGetRootVariableNum.mockReturnValue(768);
      const mockMediaQuery = { addEventListener: jest.fn(), matches: false };
      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      initSidebar('/test/');

      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1200px)');
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
        { once: false, passive: true }
      );
    });
  });

  describe('Sidebar Content Loading', () => {
    beforeEach(() => {
      mockGetRootVariableNum.mockReturnValue(768);
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
    });

    it('should load sitemap and initialize content successfully', async () => {
      const mockSitemapHtml = '<ul><li><a href="page1.html">Page 1</a></li></ul>';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockSitemapHtml),
      } as Response);
      mockLoadStyleSheet.mockResolvedValueOnce();

      initSidebar('/test/');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalledWith('/test/pagelist.html');
      expect(mockLoadStyleSheet).toHaveBeenCalledWith('/test/css/chapter.css');
      expect(mockSidebar.insertAdjacentHTML).toHaveBeenCalledWith('afterbegin', mockSitemapHtml);
      expect(mockSidebar.setAttribute).toHaveBeenCalledWith('aria-busy', 'false');
    });

    it('should handle sitemap fetch failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      initSidebar('/test/');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch /test/pagelist.html: HTTP 404')
      );
      expect(mockSidebar.insertAdjacentHTML).toHaveBeenCalledWith(
        'afterbegin',
        '<p>Error loading sidebar content.</p>'
      );
      consoleSpy.mockRestore();
    });

    it('should handle network errors during sitemap loading', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      initSidebar('/test/');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load pagelist - Network error')
      );
      expect(mockSidebar.insertAdjacentHTML).toHaveBeenCalledWith(
        'afterbegin',
        '<p>Error loading sidebar content.</p>'
      );
      consoleSpy.mockRestore();
    });

    it('should process links and mark active page correctly', async () => {
      const mockLinks = [
        { getAttribute: jest.fn().mockReturnValue('page1.html'), href: '', classList: { add: jest.fn() }, scrollIntoView: jest.fn(), setAttribute: jest.fn() },
        { getAttribute: jest.fn().mockReturnValue('page2.html'), href: '', classList: { add: jest.fn() }, scrollIntoView: jest.fn(), setAttribute: jest.fn() },
      ];
      mockScrollbox.querySelectorAll = jest.fn().mockReturnValue(mockLinks);

      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test/page1.html' },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<div>content</div>'),
      } as Response);
      mockLoadStyleSheet.mockResolvedValueOnce();

      initSidebar('/test/');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLinks[0].classList.add).toHaveBeenCalledWith('active');
      expect(mockLinks[0].scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
      expect(mockLinks[0].setAttribute).toHaveBeenCalledWith('aria-current', 'page');
      expect(mockLinks[1].classList.add).not.toHaveBeenCalledWith('active');
    });

    it('should handle links with missing href attributes', async () => {
      const mockLinks = [
        { getAttribute: jest.fn().mockReturnValue(null), href: '', classList: { add: jest.fn() } },
      ];
      mockScrollbox.querySelectorAll = jest.fn().mockReturnValue(mockLinks);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<div>content</div>'),
      } as Response);
      mockLoadStyleSheet.mockResolvedValueOnce();

      initSidebar('/test/');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        'No href attribute found for link:',
        mockLinks[0]
      );
      consoleSpy.mockRestore();
    });

    it('should only initialize content once', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<div>content</div>'),
      } as Response);
      mockLoadStyleSheet.mockResolvedValue();

      initSidebar('/test/');
      initSidebar('/test/');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockLoadStyleSheet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Event Handling', () => {
    beforeEach(() => {
      mockGetRootVariableNum.mockReturnValue(768);
      mockSearchPop.checkVisibility = jest.fn().mockReturnValue(false);
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(false);
    });

    it('should toggle sidebar on "t" key press', () => {
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 't' });
      expect(mockPage.classList.add).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('block');
    });

    it('should toggle sidebar on "T" key press (uppercase)', () => {
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 'T' });
      expect(mockPage.classList.add).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('block');
    });

    it('should hide sidebar on Escape key press', () => {
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(true);
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 'Escape' });
      expect(mockPage.classList.remove).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('none');
      expect(mockWriteLocalStorage).toHaveBeenCalledWith('mdbook-sidebar', 'hidden');
    });

    it('should ignore keyboard events when search popup is visible', () => {
      mockSearchPop.checkVisibility = jest.fn().mockReturnValue(true);
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 't' });
      expect(mockPage.classList.add).not.toHaveBeenCalledWith('show-sidebar');
    });

    it('should ignore non-toggle keys', () => {
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 'a' });
      keyupHandler({ key: 'Enter' });
      keyupHandler({ key: 'Space' });
      expect(mockPage.classList.add).not.toHaveBeenCalled();
      expect(mockPage.classList.remove).not.toHaveBeenCalled();
    });
  });

  describe('Toggle Button Functionality', () => {
    beforeEach(() => {
      mockGetRootVariableNum.mockReturnValue(768);
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(false);
    });

    it('should set up click listener on toggle button', () => {
      initSidebar('/test/');
      expect(mockToggleButton.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        { once: false, passive: true }
      );
    });

    it('should toggle sidebar when button is clicked', () => {
      initSidebar('/test/');
      const clickHandler = (mockToggleButton.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'click')?.[1];
      clickHandler();
      expect(mockPage.classList.add).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('block');
    });
  });

  describe('Click-to-Hide Functionality', () => {
    beforeEach(() => {
      mockGetRootVariableNum.mockReturnValue(768);
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
    });

    it('should add click-to-hide listener when sidebar is shown', done => {
      initSidebar('/test/');
      setTimeout(() => {
        expect(mockMain.addEventListener).toHaveBeenCalledWith(
          'pointerdown',
          expect.any(Function),
          { once: false, passive: true }
        );
        done();
      }, 10);
    });

    it('should hide sidebar on main area click for touch devices', done => {
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      initSidebar('/test/');
      setTimeout(() => {
        const clickHandler = (mockMain.addEventListener as jest.Mock).mock.calls
          .find(call => call[0] === 'pointerdown')?.[1];
        clickHandler({ pointerType: 'touch' });
        expect(mockPage.classList.remove).toHaveBeenCalledWith('show-sidebar');
        expect(mockMain.removeEventListener).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should not hide sidebar on main area click for mouse on desktop', done => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      initSidebar('/test/');
      setTimeout(() => {
        const clickHandler = (mockMain.addEventListener as jest.Mock).mock.calls
          .find(call => call[0] === 'pointerdown')?.[1];
        clickHandler({ pointerType: 'mouse' });
        expect(mockPage.classList.remove).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('Responsive Behavior', () => {
    it('should show sidebar when media query matches large screen', () => {
      mockGetRootVariableNum.mockReturnValue(768);
      const mockMediaQuery = { addEventListener: jest.fn(), matches: false };
      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      initSidebar('/test/');

      const mediaChangeHandler = mockMediaQuery.addEventListener.mock.calls
        .find(call => call[0] === 'change')?.[1];
      mediaChangeHandler({ matches: true });

      expect(mockPage.classList.add).toHaveBeenCalledWith('show-sidebar');
      expect(mockSidebar.style.display).toBe('block');
    });

    it('should not trigger media query handler when matches is false', () => {
      mockGetRootVariableNum.mockReturnValue(768);
      const mockMediaQuery = { addEventListener: jest.fn(), matches: false };
      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      initSidebar('/test/');
      const mediaChangeHandler = mockMediaQuery.addEventListener.mock.calls
        .find(call => call[0] === 'change')?.[1];
      jest.clearAllMocks();
      mediaChangeHandler({ matches: false });

      expect(mockPage.classList.add).not.toHaveBeenCalled();
    });
  });

  describe('State Persistence', () => {
    beforeEach(() => {
      mockGetRootVariableNum.mockReturnValue(768);
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
    });

    it('should save "visible" state to localStorage when showing sidebar', () => {
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(false);
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 't' });
      expect(mockWriteLocalStorage).toHaveBeenCalledWith('mdbook-sidebar', 'visible');
    });

    it('should save "hidden" state to localStorage when hiding sidebar', () => {
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(true);
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 't' });
      expect(mockWriteLocalStorage).toHaveBeenCalledWith('mdbook-sidebar', 'hidden');
    });

    it('should not save to localStorage when write parameter is false', () => {
      localStorageMock.getItem.mockReturnValue('hidden');
      initSidebar('/test/');
      expect(mockWriteLocalStorage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(() => {
      mockGetRootVariableNum.mockReturnValue(768);
    });

    it('should set aria-busy during content loading', () => {
      initSidebar('/test/');
      expect(mockSidebar.setAttribute).toHaveBeenCalledWith('aria-busy', 'true');
    });

    it('should set aria-expanded on toggle button when sidebar is shown', () => {
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(false);
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 't' });
      expect(mockToggleButton.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
    });

    it('should set aria-expanded to false when sidebar is hidden', () => {
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(true);
      initSidebar('/test/');
      const keyupHandler = (document.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'keyup')?.[1];
      keyupHandler({ key: 't' });
      expect(mockToggleButton.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    it('should set aria-hidden when sidebar is hidden', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      initSidebar('/test/');
      expect(mockSidebar.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
    });

    it('should remove aria-hidden when sidebar is shown', () => {
      mockSidebar.checkVisibility = jest.fn().mockReturnValue(false);
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      initSidebar('/test/');
      expect(mockSidebar.removeAttribute).toHaveBeenCalledWith('aria-hidden');
    });
  });

  describe('URL Handling', () => {
    it('should handle URLs ending with slash by appending index.html', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test/' },
      });
      const mockLinks = [
        { getAttribute: jest.fn().mockReturnValue('index.html'), href: '', classList: { add: jest.fn() }, scrollIntoView: jest.fn(), setAttribute: jest.fn() },
      ];
      mockScrollbox.querySelectorAll = jest.fn().mockReturnValue(mockLinks);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<div>content</div>'),
      } as Response);
      mockLoadStyleSheet.mockResolvedValueOnce();
      mockGetRootVariableNum.mockReturnValue(768);

      initSidebar('/test/');
      expect(mockLinks[0].classList.add).toHaveBeenCalledWith('active');
    });

    it('should handle regular URLs without modification', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/test/page.html' },
      });
      const mockLinks = [
        { getAttribute: jest.fn().mockReturnValue('page.html'), href: '', classList: { add: jest.fn() }, scrollIntoView: jest.fn(), setAttribute: jest.fn() },
      ];
      mockScrollbox.querySelectorAll = jest.fn().mockReturnValue(mockLinks);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<div>content</div>'),
      } as Response);
      mockLoadStyleSheet.mockResolvedValueOnce();
      mockGetRootVariableNum.mockReturnValue(768);

      initSidebar('/test/');
      expect(mockLinks[0].classList.add).toHaveBeenCalledWith('active');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle unknown error types during sitemap loading', async () => {
      mockFetch.mockRejectedValueOnce('String error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetRootVariableNum.mockReturnValue(768);

      initSidebar('/test/');
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith('An unknown error occurred');
      expect(mockSidebar.insertAdjacentHTML).toHaveBeenCalledWith(
        'afterbegin',
        '<p>Error loading sidebar content.</p>'
      );
      consoleSpy.mockRestore();
    });

    it('should handle missing DOM elements gracefully', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      mockGetRootVariableNum.mockReturnValue(768);
      expect(() => initSidebar('/test/')).not.toThrow();
    });
  });
}); // End of main describe block