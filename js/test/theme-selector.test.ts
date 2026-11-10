// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadStyleSheet: vi.fn(),
  unloadStyleSheet: vi.fn(),
  readLocalStorage: vi.fn(),
  writeLocalStorage: vi.fn(),
  isSearchPopoverOpen: vi.fn(),
  toastWarn: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock('@/constants.ts', () => ({
  ROOT_PATH: '/assets/',
}));

vi.mock('@/searchHelper.ts', () => ({
  isSearchPopoverOpen: mocks.isSearchPopoverOpen,
}));

vi.mock('@/utils/css-loader.ts', () => ({
  loadStyleSheet: mocks.loadStyleSheet,
  unloadStyleSheet: mocks.unloadStyleSheet,
}));

vi.mock('@/utils/storage.ts', () => ({
  readLocalStorage: mocks.readLocalStorage,
  writeLocalStorage: mocks.writeLocalStorage,
}));

vi.mock('@/utils/toast.ts', () => ({
  default: {
    warn: mocks.toastWarn,
    error: mocks.toastError,
    info: mocks.toastInfo,
  },
}));

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('theme selector', () => {
  let bootThemeColor: typeof import('@/theme-selector.ts').bootThemeColor;
  let mediaQuery: MediaQueryList;
  let mediaChangeListener: ((event: MediaQueryListEvent) => void) | undefined;
  let frames: FrameRequestCallback[];
  let documentListeners: Array<{
    type: string;
    listener: EventListenerOrEventListenerObject;
    options: boolean | AddEventListenerOptions | undefined;
  }> = [];
  let locationDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="page"></div><button id="theme-btn"></button>';

    mocks.loadStyleSheet.mockReset();
    mocks.loadStyleSheet.mockResolvedValue(undefined);

    mocks.unloadStyleSheet.mockReset();

    mocks.readLocalStorage.mockReset();
    mocks.readLocalStorage.mockReturnValue(null);

    mocks.writeLocalStorage.mockReset();

    mocks.isSearchPopoverOpen.mockReset();
    mocks.isSearchPopoverOpen.mockReturnValue(false);

    mocks.toastWarn.mockReset();
    mocks.toastError.mockReset();
    mocks.toastInfo.mockReset();

    locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: new URL('https://example.test/'),
    });

    mediaChangeListener = undefined;
    mediaQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        mediaChangeListener = listener as (event: MediaQueryListEvent) => void;
      }),
    } as unknown as MediaQueryList;

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaQuery),
    );

    frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });

    documentListeners = [];
    const addDocumentListener = document.addEventListener.bind(document);

    vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
      documentListeners.push({ type, listener, options });
      addDocumentListener(type, listener, options);
    });

    bootThemeColor = (await import('@/theme-selector.ts')).bootThemeColor;
  });

  afterEach(() => {
    for (const { type, listener, options } of documentListeners) {
      document.removeEventListener(type, listener, options);
    }

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();

    if (locationDescriptor !== undefined) {
      Object.defineProperty(window, 'location', locationDescriptor);
    }
  });

  it('loads the default light theme when no preference is stored', async () => {
    await bootThemeColor();

    Object.defineProperty(mediaQuery, 'matches', {
      configurable: true,
      value: true,
    });

    mediaChangeListener?.({ matches: true } as MediaQueryListEvent);

    await flushPromises();

    expect(mocks.readLocalStorage).toHaveBeenCalledWith('mdbook-theme:light');
    expect(mocks.loadStyleSheet.mock.calls[0]?.[0]).toBe('/assets/css/catppuccin/latte.css');
    expect(mediaQuery.addEventListener).toHaveBeenCalledOnce();
  });

  it('applies and stores the saved dark theme after the system preference changes', async () => {
    mocks.readLocalStorage.mockImplementation((key: string) => (key === 'mdbook-theme:dark' ? 'mocha' : null));

    await bootThemeColor();

    Object.defineProperty(mediaQuery, 'matches', {
      configurable: true,
      value: true,
    });

    mediaChangeListener?.({ matches: true } as MediaQueryListEvent);
    await flushPromises();

    expect(mocks.loadStyleSheet.mock.calls[0]?.[0]).toBe('/assets/css/catppuccin/latte.css');
    expect(mocks.loadStyleSheet.mock.calls[1]?.[0]).toBe('/assets/css/catppuccin/mocha.css');
    expect(mocks.unloadStyleSheet).toHaveBeenCalledWith('/assets/css/catppuccin/latte.css');
    expect(mocks.writeLocalStorage).toHaveBeenCalledWith('mdbook-theme:dark', 'mocha');
  });

  it('falls back to the default theme when the saved theme fails to load', async () => {
    mocks.readLocalStorage.mockReturnValue('frappe');
    mocks.loadStyleSheet.mockRejectedValueOnce(new Error('stylesheet unavailable')).mockResolvedValueOnce(undefined);

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await bootThemeColor();

    expect(mocks.loadStyleSheet.mock.calls[0]?.[0]).toBe('/assets/css/catppuccin/frappe.css');
    expect(mocks.loadStyleSheet.mock.calls[1]?.[0]).toBe('/assets/css/catppuccin/latte.css');
    expect(mocks.toastWarn).toHaveBeenCalledWith('Failed to load "frappe" theme...');
    expect(mocks.toastError).toHaveBeenCalledWith('Failed to load frappe color theme!');
    expect(mocks.toastInfo).toHaveBeenCalledWith('Attempting to apply the default theme...');
    expect(consoleError).toHaveBeenCalled();
  });

  it('loads the theme selector and applies a selected theme', async () => {
    await bootThemeColor();

    const button = document.getElementById('theme-btn') as HTMLButtonElement;
    button.click();

    const themeList = document.getElementById('theme-list');
    expect(themeList).not.toBeNull();

    const showPopover = vi.fn();
    const togglePopover = vi.fn();
    Object.defineProperty(themeList, 'showPopover', {
      configurable: true,
      value: showPopover,
    });
    Object.defineProperty(themeList, 'togglePopover', {
      configurable: true,
      value: togglePopover,
    });
    Object.defineProperty(themeList, 'matches', {
      configurable: true,
      value: vi.fn(() => true),
    });

    await flushPromises();

    expect(mocks.loadStyleSheet).toHaveBeenCalledWith('/assets/css/theme-list.css');
    expect(showPopover).toHaveBeenCalledOnce();
    expect(frames).toHaveLength(1);

    frames.shift()?.(0);

    const latteRadio = themeList?.querySelector<HTMLInputElement>('input[value="latte"]');
    expect(document.activeElement).toBe(latteRadio);

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'c' }));
    expect(togglePopover).toHaveBeenCalledOnce();

    const mochaRadio = themeList?.querySelector<HTMLInputElement>('input[value="mocha"]');

    mochaRadio?.dispatchEvent(new Event('change', { bubbles: true }));
    await flushPromises();

    expect(mocks.loadStyleSheet.mock.calls.at(-1)?.[0]).toBe('/assets/css/catppuccin/mocha.css');
    expect(mocks.unloadStyleSheet).toHaveBeenCalledWith('/assets/css/catppuccin/latte.css');
    expect(mocks.writeLocalStorage).toHaveBeenCalledWith('mdbook-theme:light', 'mocha');
  });

  it('reports when the theme button is missing', async () => {
    document.body.innerHTML = '<div id="page"></div>';

    await bootThemeColor();

    expect(mocks.toastError).toHaveBeenCalledWith('Theme selection is currently unavailable.');
  });
});
