// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/constants.ts', () => ({
  ROOT_PATH: 'https://coralpink.github.io/commentary/',
}));

import { loadStyleSheet, unloadStyleSheet } from '@/utils/css-loader.ts';

const FILE_NAME = 'css/theme.css';
const FILE_URL = 'https://coralpink.github.io/commentary/css/theme.css';

const preventStylesheetFetch = () =>
  vi.spyOn(document.head, 'append').mockImplementation(() => {});

afterEach(() => {
  vi.restoreAllMocks();
  document.head.replaceChildren();
});

describe('loadStyleSheet', () => {
  it('resolves when the stylesheet loads', async () => {
    const appendSpy = preventStylesheetFetch();
    const promise = loadStyleSheet(FILE_NAME);
    const link = appendSpy.mock.calls[0]?.[0] as HTMLLinkElement | undefined;

    expect(link).toBeDefined();
    expect(link?.href).toBe(FILE_URL);

    link?.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects when the stylesheet fails to load', async () => {
    const appendSpy = preventStylesheetFetch();
    const promise = loadStyleSheet(FILE_NAME);
    const link = appendSpy.mock.calls[0]?.[0] as HTMLLinkElement | undefined;

    expect(link).toBeDefined();
    link?.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow(`Failed to load stylesheet: ${FILE_NAME}`);
  });

  it('rejects and removes the link when aborted', async () => {
    const appendSpy = preventStylesheetFetch();
    const controller = new AbortController();
    const promise = loadStyleSheet(FILE_NAME, { signal: controller.signal });
    const link = appendSpy.mock.calls[0]?.[0] as HTMLLinkElement | undefined;

    controller.abort();

    await expect(promise).rejects.toThrow('Stylesheet loading was aborted');
    expect(link?.isConnected).toBe(false);
  });

  it('throws immediately when the signal is already aborted', () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => loadStyleSheet(FILE_NAME, { signal: controller.signal })).toThrow('Stylesheet loading was aborted');
  });
});

describe('unloadStyleSheet', () => {
  it('removes the stylesheet with the matching URL', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FILE_URL;
    document.head.append(link);

    unloadStyleSheet(FILE_NAME);

    expect(link.isConnected).toBe(false);
  });

  it('does not remove a stylesheet with a different URL', () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://coralpink.github.io/commentary/css/other.css';
    document.head.append(link);

    unloadStyleSheet(FILE_NAME);

    expect(link.isConnected).toBe(true);
  });

  it('throws when requested and no matching stylesheet exists', () => {
    expect(() => unloadStyleSheet(FILE_NAME, true)).toThrow(`Stylesheet not found: ${FILE_NAME}`);
  });

  it('does not throw when no matching stylesheet exists and throwing is disabled', () => {
    expect(() => unloadStyleSheet(FILE_NAME)).not.toThrow();
  });
});
