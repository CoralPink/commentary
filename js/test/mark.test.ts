// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cycle: 1,
  highlights: {
    clear: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/searchHelper.ts', () => ({
  isSearchPopoverOpen: vi.fn(() => false),
}));

vi.mock('@/utils/pulse.ts', () => ({
  getCurrentCycle: () => mocks.cycle,
  isCurrentCycle: (expectedCycle: number) => expectedCycle === mocks.cycle,
}));

class TestHighlight {
  readonly ranges: Range[];

  constructor(...ranges: Range[]) {
    this.ranges = ranges;
  }
}

let testLocation: URL;

const setMarkParam = (term: string | null): void => {
  if (term === null) {
    testLocation.searchParams.delete('mark');
  } else {
    testLocation.searchParams.set('mark', term);
  }
};

const createFixture = (): { article: HTMLElement; button: HTMLButtonElement } => {
  const article = document.createElement('article');
  article.id = 'article';
  article.textContent = 'abcd';

  const button = document.createElement('button');
  button.id = 'mark-btn';
  button.classList.add('hidden');

  const icon = document.createElement('div');
  icon.classList.add('icon-marker');
  button.append(icon);

  document.body.append(article, button);

  return { article, button };
};

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('mark', () => {
  let mark: typeof import('@/mark.ts');
  let wasmMocks: typeof import('./mocks/wasm_book.ts');
  let locationDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    vi.resetModules();

    document.body.replaceChildren();
    mocks.cycle = 1;

    locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    testLocation = new URL('https://example.test/');
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: testLocation,
    });

    wasmMocks = await import('./mocks/wasm_book.ts');

    wasmMocks.mockInitWasm.mockReset();
    wasmMocks.mockInitWasm.mockResolvedValue(undefined);

    wasmMocks.mockGetMatchSentences.mockReset();
    wasmMocks.mockGetMatchSentences.mockImplementation((term: string) => {
      const start = term === 'new' ? 2 : 0;

      return {
        index: [{ start, end: start + 1 }],
        hadMatch: true,
      };
    });

    mocks.highlights.clear.mockClear();
    mocks.highlights.set.mockClear();

    vi.stubGlobal('CSS', { highlights: mocks.highlights });
    vi.stubGlobal('Highlight', TestHighlight);

    setMarkParam('old');
    expect(new URLSearchParams(globalThis.location.search).get('mark')).toBe('old');

    mark = await import('@/mark.ts');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();

    if (locationDescriptor !== undefined) {
      Object.defineProperty(window, 'location', locationDescriptor);
    } else {
      Reflect.deleteProperty(window, 'location');
    }
  });

  it('creates a highlight and shows the button when a match is found', async () => {
    const { article, button } = createFixture();

    mark.initMark(article, mocks.cycle);

    expect(wasmMocks.mockInitWasm).toHaveBeenCalledOnce();

    await flushPromises();

    expect(mocks.highlights.set).toHaveBeenCalledOnce();
    expect(mocks.highlights.set).toHaveBeenCalledWith('marking', expect.any(TestHighlight));

    const highlight = mocks.highlights.set.mock.calls[0]?.[1] as TestHighlight;
    expect(highlight.ranges[0]?.startOffset).toBe(0);

    expect(button.classList.contains('hidden')).toBe(false);
    expect(button.ariaPressed).toBe('true');
  });

  it('ignores a result completed after the cycle changes', async () => {
    const { article, button } = createFixture();

    let resolveWasm!: () => void;

    wasmMocks.mockInitWasm.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveWasm = resolve;
        }),
    );

    mark.initMark(article, mocks.cycle);

    expect(wasmMocks.mockInitWasm).toHaveBeenCalledOnce();

    mocks.cycle += 1;
    resolveWasm();

    await flushPromises();

    expect(mocks.highlights.set).not.toHaveBeenCalled();
    expect(button.classList.contains('hidden')).toBe(true);
  });

  it('ignores a result when the article is removed before completion', async () => {
    const { article, button } = createFixture();

    let resolveWasm!: () => void;

    wasmMocks.mockInitWasm.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveWasm = resolve;
        }),
    );

    mark.initMark(article, mocks.cycle);

    article.remove();
    resolveWasm();

    await flushPromises();

    expect(mocks.highlights.set).not.toHaveBeenCalled();
    expect(button.classList.contains('hidden')).toBe(true);
  });

  it('keeps the newer result when an older request completes later in the same cycle', async () => {
    const { article } = createFixture();
    const resolveWasm: Array<() => void> = [];

    wasmMocks.mockInitWasm.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveWasm.push(resolve);
        }),
    );

    setMarkParam('old');
    mark.initMark(article, mocks.cycle);

    setMarkParam('new');
    mark.initMark(article, mocks.cycle);

    expect(wasmMocks.mockInitWasm).toHaveBeenCalledTimes(2);
    expect(resolveWasm).toHaveLength(2);

    // Complete the newer request first.
    resolveWasm[1]!();
    await flushPromises();

    expect(mocks.highlights.set).toHaveBeenCalledOnce();

    const latestHighlight = mocks.highlights.set.mock.calls[0]?.[1] as TestHighlight;
    expect(latestHighlight.ranges[0]?.startOffset).toBe(2);

    // The older request must not overwrite the newer result.
    resolveWasm[0]!();
    await flushPromises();

    expect(mocks.highlights.set).toHaveBeenCalledOnce();
    expect(latestHighlight.ranges[0]?.startOffset).toBe(2);
  });

  it('ignores a stale no-match result after a newer match is highlighted', async () => {
    const { article, button } = createFixture();
    const resolveWasm: Array<() => void> = [];

    wasmMocks.mockInitWasm.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveWasm.push(resolve);
        }),
    );

    wasmMocks.mockGetMatchSentences.mockImplementation((term: string) => {
      if (term === 'old-no-match') {
        return { index: [], hadMatch: false };
      }

      return {
        index: [{ start: 2, end: 3 }],
        hadMatch: true,
      };
    });

    setMarkParam('old-no-match');
    mark.initMark(article, mocks.cycle);

    setMarkParam('new-match');
    mark.initMark(article, mocks.cycle);

    expect(resolveWasm).toHaveLength(2);

    // Apply the new match results first
    resolveWasm[1]!();
    await flushPromises();

    expect(mocks.highlights.set).toHaveBeenCalledOnce();
    expect(mocks.highlights.clear).not.toHaveBeenCalled();
    expect(button.classList.contains('hidden')).toBe(false);

    // Do not clear the display even if older “No matches” results come in later
    resolveWasm[0]!();
    await flushPromises();

    expect(mocks.highlights.clear).not.toHaveBeenCalled();
    expect(mocks.highlights.set).toHaveBeenCalledOnce();
    expect(button.classList.contains('hidden')).toBe(false);
  });

  it('does not restore a highlight when unmarking invalidates a pending request', async () => {
    const { article } = createFixture();

    let resolveWasm!: () => void;

    wasmMocks.mockInitWasm.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveWasm = resolve;
        }),
    );

    mark.initMark(article, mocks.cycle);

    expect(wasmMocks.mockInitWasm).toHaveBeenCalledOnce();

    mark.unmarking();
    resolveWasm();

    await flushPromises();

    expect(mocks.highlights.clear).toHaveBeenCalledOnce();
    expect(mocks.highlights.set).not.toHaveBeenCalled();
  });
});
