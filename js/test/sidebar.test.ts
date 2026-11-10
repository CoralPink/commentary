// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadPageList: vi.fn(),
  isSearchPopoverOpen: vi.fn(() => false),
  toastError: vi.fn(),
}));

vi.mock('@/constants.ts', () => ({
  BREAKPOINT_UI_WIDE: 800,
  CONTENT_READY: 'content-ready',
}));

vi.mock('@/pagelist.ts', () => ({
  default: {
    load: mocks.loadPageList,
  },
}));

vi.mock('@/searchHelper.ts', () => ({
  isSearchPopoverOpen: mocks.isSearchPopoverOpen,
}));

vi.mock('@/utils/toast.ts', () => ({
  default: {
    error: mocks.toastError,
  },
}));

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const setDocumentUrl = (href: string): void => {
  const url = new URL(href);

  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: url,
  });

  Object.defineProperty(document, 'location', {
    configurable: true,
    value: url,
  });
};

describe('sidebar', () => {
  let bootSidebar: typeof import('@/sidebar.ts').bootSidebar;
  let locationDescriptor: PropertyDescriptor | undefined;
  let mediaChangeListener: ((event: MediaQueryListEvent) => void) | undefined;

  beforeEach(async () => {
    vi.resetModules();
    document.body.replaceChildren();

    mocks.loadPageList.mockReset();
    mocks.loadPageList.mockResolvedValue(undefined);
    mocks.isSearchPopoverOpen.mockReset();
    mocks.isSearchPopoverOpen.mockReturnValue(false);
    mocks.toastError.mockReset();

    locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    setDocumentUrl('https://example.test/current/');

    vi.stubGlobal('innerWidth', 700);

    mediaChangeListener = undefined;
    const mediaQueryList = {
      addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        mediaChangeListener = listener as (event: MediaQueryListEvent) => void;
      }),
    } as unknown as MediaQueryList;

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaQueryList),
    );

    bootSidebar = (await import('@/sidebar.ts')).bootSidebar;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    document.body.replaceChildren();

    if (locationDescriptor !== undefined) {
      Object.defineProperty(window, 'location', locationDescriptor);
    }
  });

  it('reports that the sidebar is unavailable when its button is missing', () => {
    bootSidebar();

    expect(mocks.toastError).toHaveBeenCalledWith('Sidebar is currently unavailable.');
  });

  it('toggles the sidebar, handles dismissal, and updates the active page', async () => {
    setDocumentUrl('https://example.test/current/');

    document.body.innerHTML = `
      <div id="page"></div>
      <main id="main"></main>
      <aside id="sidebar" style="display: block">
        <div id="sidebar-scrollbox">
          <a href="https://example.test/current/index.html">Current</a>
          <a href="https://example.test/other/index.html">Other</a>
        </div>
      </aside>
      <button id="sidebar-btn"></button>
    `;

    const page = document.getElementById('page')!;
    const main = document.getElementById('main')!;
    const sidebar = document.getElementById('sidebar')!;
    const button = document.getElementById('sidebar-btn') as HTMLButtonElement;
    const [currentLink, otherLink] = document.querySelectorAll<HTMLAnchorElement>('#sidebar-scrollbox a');

    const currentScroll = vi.fn();
    Object.defineProperty(currentLink, 'scrollIntoView', {
      configurable: true,
      value: currentScroll,
    });

    Object.defineProperty(sidebar, 'checkVisibility', {
      configurable: true,
      value: () => sidebar.style.display !== 'none',
    });

    bootSidebar();

    // At a narrow width, booting hides the sidebar.
    expect(sidebar.style.display).toBe('none');

    // The shortcut is ignored while search is open.
    mocks.isSearchPopoverOpen.mockReturnValue(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    expect(sidebar.style.display).toBe('none');
    expect(mocks.loadPageList).not.toHaveBeenCalled();

    // The shortcut opens it when search is closed.
    mocks.isSearchPopoverOpen.mockReturnValue(false);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 't' }));
    expect(sidebar.style.display).toBe('block');

    await flushPromises();

    expect(mocks.loadPageList).toHaveBeenCalled();
    expect(page.classList.contains('show-sidebar')).toBe(true);
    expect(currentLink?.classList.contains('active')).toBe(true);
    expect(currentLink?.ariaCurrent).toBe('page');
    expect(currentScroll).toHaveBeenCalledWith({ block: 'center' });

    // A pointer down outside the sidebar hides it on a narrow screen.
    main.dispatchEvent(new Event('pointerdown'));
    expect(sidebar.style.display).toBe('none');
    expect(button.ariaExpanded).toBe('false');

    // Escape also hides the sidebar.
    button.click();
    await flushPromises();
    expect(sidebar.style.display).toBe('block');

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    expect(sidebar.style.display).toBe('none');

    // A matching media query opens it.
    mediaChangeListener?.({ matches: true } as MediaQueryListEvent);
    await flushPromises();
    expect(sidebar.style.display).toBe('block');

    // Outside pointer downs do not hide it at a wide viewport.
    vi.stubGlobal('innerWidth', 1200);
    main.dispatchEvent(new Event('pointerdown'));
    expect(sidebar.style.display).toBe('block');

    setDocumentUrl('https://example.test/other/');
    document.dispatchEvent(new Event('content-ready'));

    expect(currentLink?.classList.contains('active')).toBe(false);
    expect(otherLink?.classList.contains('active')).toBe(true);
    expect(otherLink?.ariaCurrent).toBe('page');
  });
});
