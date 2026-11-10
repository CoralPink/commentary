// @vitest-environment happy-dom

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  updateMark: vi.fn(),
  getSearchBar: vi.fn(),
  setHTML: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@/mark.ts', () => ({
  updateMark: mocks.updateMark,
}));

vi.mock('@/searchHelper.ts', () => ({
  getSearchBar: mocks.getSearchBar,
}));

vi.mock('@/utils/html-sanitizer.ts', () => ({
  setHTML: mocks.setHTML,
}));

const TAG_NAME = 'test-search-results';

type ResultsElement = HTMLElement & {
  update(html: string): void;
  focusFirstResult(): void;
  focusAndSelect(): void;
  clear(): void;
};

const createResults = (): ResultsElement => document.createElement(TAG_NAME) as ResultsElement;

const createRow = ({
  page = '/page.html',
  label = 'Page',
  score = '42',
  href = 'https://example.test/page.html',
  excerpt = '<strong>Matched excerpt</strong>',
}: {
  page?: string;
  label?: string;
  score?: string;
  href?: string;
  excerpt?: string;
} = {}): string =>
  `<div data-page="${page}" data-label="${label}" data-score="${score}" data-href="${href}">${excerpt}</div>`;

describe('SearchResults', () => {
  let searchBar: HTMLInputElement;
  let navigationTarget: { navigate: typeof mocks.navigate };
  let locationDescriptor: PropertyDescriptor | undefined;

  beforeAll(async () => {
    const { SearchResults } = await import('@/searchResults.ts');

    if (customElements.get(TAG_NAME) === undefined) {
      customElements.define(TAG_NAME, SearchResults);
    }

    locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
  });

  beforeEach(() => {
    document.body.replaceChildren();

    mocks.updateMark.mockClear();
    mocks.navigate.mockClear();
    mocks.getSearchBar.mockClear();
    mocks.setHTML.mockReset();

    searchBar = document.createElement('input');
    document.body.append(searchBar);
    mocks.getSearchBar.mockReturnValue(searchBar);

    mocks.setHTML.mockImplementation((element: HTMLElement, html: string) => {
      element.innerHTML = html;
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: new URL('https://example.test/current'),
    });

    navigationTarget = { navigate: mocks.navigate };
    vi.stubGlobal('navigation', navigationTarget);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  afterAll(() => {
    if (locationDescriptor !== undefined) {
      Object.defineProperty(window, 'location', locationDescriptor);
    }
  });

  it('renders valid results and skips entries with missing data', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const results = createResults();
    document.body.append(results);

    results.update(
      `${createRow({ label: 'A page', score: '900' })} <div data-page="/invalid.html" data-label="Invalid"></div>`,
    );

    const rows = results.querySelectorAll<HTMLElement>('[role="option"]');

    expect(rows).toHaveLength(1);
    expect(rows[0]?.className).toBe('result');
    expect(rows[0]?.tabIndex).toBe(0);
    expect(rows[0]?.ariaLabel).toBe('/page.html 900pt');

    expect(rows[0]?.querySelector('.label')?.textContent).toBe('A page');
    expect(rows[0]?.querySelector('.excerpt strong')?.textContent).toBe('Matched excerpt');

    const meter = rows[0]?.querySelector('meter');
    expect(meter?.getAttribute('min')).toBe('1');
    expect(meter?.getAttribute('max')).toBe('512');
    expect(meter?.getAttribute('value')).toBe('512');
    expect(rows[0]?.querySelector('.score span')?.textContent).toBe('900pt');

    expect(consoleWarn).toHaveBeenCalledWith('SearchResults#update: invalid data');
  });

  it('moves focus with the arrow keys and returns to the search bar at the first result', () => {
    const results = createResults();
    document.body.append(results);

    results.update(
      createRow({ page: '/first.html', label: 'First' }) + createRow({ page: '/second.html', label: 'Second' }),
    );

    const [first, second] = results.querySelectorAll<HTMLElement>('[role="option"]');

    results.focusFirstResult();

    expect(document.activeElement).toBe(first);
    expect(first?.ariaSelected).toBe('true');
    expect(searchBar.ariaActiveDescendantElement).toBe(first);

    const arrowDown = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    first?.dispatchEvent(arrowDown);

    expect(arrowDown.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(second);
    expect(first?.ariaSelected).toBeNull();
    expect(second?.ariaSelected).toBe('true');

    const arrowUp = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    second?.dispatchEvent(arrowUp);

    expect(arrowUp.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);

    const arrowUpFromFirst = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    });
    first?.dispatchEvent(arrowUpFromFirst);

    expect(document.activeElement).toBe(searchBar);
  });

  it('opens a same-page result on the second click and updates the mark', () => {
    const results = createResults();
    document.body.append(results);

    results.update(createRow({ href: 'https://example.test/current#section' }));

    const result = results.querySelector<HTMLElement>('[role="option"]');
    expect(result).not.toBeNull();

    result?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // The first click selects the result.
    expect(result?.ariaSelected).toBe('true');
    expect(mocks.navigate).not.toHaveBeenCalled();

    result?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(mocks.updateMark).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith(new URL('https://example.test/current#section'));
  });

  it('opens an external result on Enter without updating the mark', () => {
    const results = createResults();
    document.body.append(results);

    results.update(createRow({ href: 'https://other.example/page.html' }));

    const result = results.querySelector<HTMLElement>('[role="option"]');
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });

    result?.dispatchEvent(enter);

    expect(mocks.updateMark).not.toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith(new URL('https://other.example/page.html'));
  });

  it('supports focusAndSelect and clear, including when there are no results', () => {
    const results = createResults();
    document.body.append(results);

    expect(() => results.focusFirstResult()).not.toThrow();
    expect(() => results.focusAndSelect()).not.toThrow();

    results.update(createRow());
    const first = results.querySelector<HTMLElement>('[role="option"]');

    results.focusAndSelect();

    expect(document.activeElement).toBe(first);
    expect(first?.ariaSelected).toBe('true');

    results.clear();

    expect(results.children).toHaveLength(0);
  });

  it('removes event listeners when disconnected', () => {
    const results = createResults();
    document.body.append(results);

    results.update(createRow());
    const result = results.querySelector<HTMLElement>('[role="option"]');

    results.remove();

    result?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    result?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.updateMark).not.toHaveBeenCalled();
  });
});
