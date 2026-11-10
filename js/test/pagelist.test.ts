// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchText: vi.fn(),
  setHTML: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/constants.ts', () => ({
  ROOT_PATH: '/assets/',
}));

vi.mock('@/utils/fetch.ts', () => ({
  fetchText: mocks.fetchText,
}));

vi.mock('@/utils/html-sanitizer.ts', () => ({
  setHTML: mocks.setHTML,
}));

vi.mock('@/utils/toast.ts', () => ({
  default: {
    error: mocks.toastError,
  },
}));

describe('pagelist', () => {
  let pagelist: typeof import('@/pagelist.ts').default;

  beforeEach(async () => {
    vi.resetModules();

    mocks.fetchText.mockReset();
    mocks.setHTML.mockReset();
    mocks.toastError.mockReset();

    mocks.setHTML.mockImplementation((element: HTMLElement, html: string) => {
      element.innerHTML = html;
    });

    pagelist = (await import('@/pagelist.ts')).default;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('loads the page list once and skips later loads after success', async () => {
    const firstElement = document.createElement('div');
    const secondElement = document.createElement('div');
    const html = '<ul><li>Page</li></ul>';

    mocks.fetchText.mockResolvedValue(html);

    const pending = pagelist.load(firstElement);

    expect(firstElement.ariaBusy).toBe('true');
    expect(mocks.fetchText).toHaveBeenCalledWith('/assets/pagelist.html');

    await pending;

    expect(mocks.setHTML).toHaveBeenCalledWith(firstElement, html);
    expect(firstElement.innerHTML).toBe(html);
    expect(firstElement.ariaBusy).toBe('false');

    await pagelist.load(secondElement);

    expect(mocks.fetchText).toHaveBeenCalledOnce();
    expect(mocks.setHTML).toHaveBeenCalledOnce();
    expect(secondElement.getAttribute('aria-busy')).toBeNull();
  });

  it('shows a fallback and allows retry after a failed load', async () => {
    const element = document.createElement('div');

    mocks.fetchText.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('<p>Recovered</p>');

    await pagelist.load(element);

    expect(mocks.setHTML).toHaveBeenNthCalledWith(1, element, 'Sorry!!');
    expect(mocks.toastError).toHaveBeenCalledWith('Failed to load pagelist - Error: offline');
    expect(element.ariaBusy).toBe('false');

    await pagelist.load(element);

    expect(mocks.fetchText).toHaveBeenCalledTimes(2);
    expect(mocks.setHTML).toHaveBeenNthCalledWith(2, element, '<p>Recovered</p>');
    expect(element.innerHTML).toBe('<p>Recovered</p>');
    expect(element.ariaBusy).toBe('false');
  });
});
