// @vitest-environment happy-dom

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  bootSidebar: vi.fn(),
  bootTableOfContents: vi.fn(),
  startupSearch: vi.fn(),
  initTableOfContents: vi.fn(),
  initMark: vi.fn(),
  hiddenSearch: vi.fn(),
  scheduleJob: vi.fn(),
  prepareForNextCycle: vi.fn(() => 0),
  isCurrentCycle: vi.fn(() => true),
  registerServiceWorker: vi.fn(),
  cycle: 0,
}));

vi.mock('@/constants.ts', () => ({
  CONTENT_READY: 'content-ready',
  ROOT_PATH: '/assets/',
}));

vi.mock('@/mark.ts', () => ({
  initMark: mocks.initMark,
}));

vi.mock('@/searcher.ts', () => ({
  hiddenSearch: mocks.hiddenSearch,
  startupSearch: mocks.startupSearch,
}));

vi.mock('@/sidebar.ts', () => ({
  bootSidebar: mocks.bootSidebar,
}));

vi.mock('@/table-of-contents.ts', () => ({
  bootTableOfContents: mocks.bootTableOfContents,
  initTableOfContents: mocks.initTableOfContents,
}));

vi.mock('@/extensions/element.ts', () => ({
  ELEMENT_MEDIA_SLIDER: 'media-slider',
  ELEMENT_YOUTUBE: 'youtube-video',
}));

vi.mock('@/utils/platform.ts', () => ({
  isWebkitBased: () => false,
}));

vi.mock('../utils/pulse.ts', () => ({
  scheduleJob: (job: () => void) => {
    mocks.scheduleJob(job);
    job();
  },
  prepareForNextCycle: mocks.prepareForNextCycle,
  isCurrentCycle: (expectedCycle: number) => expectedCycle === mocks.cycle,
}));

describe('initialize', () => {
  let serviceWorkerDescriptor: PropertyDescriptor | undefined;

  beforeAll(async () => {
    serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

    mocks.registerServiceWorker.mockClear();
    mocks.registerServiceWorker.mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: mocks.registerServiceWorker,
      },
    });

    await import('@/initialize.ts');

    expect(mocks.registerServiceWorker).toHaveBeenCalledOnce();
  });

  beforeEach(() => {
    mocks.bootSidebar.mockClear();
    mocks.bootTableOfContents.mockClear();
    mocks.startupSearch.mockClear();
    mocks.initTableOfContents.mockClear();
    mocks.initMark.mockClear();
    mocks.hiddenSearch.mockClear();
    mocks.scheduleJob.mockClear();

    mocks.cycle = 0;
    mocks.prepareForNextCycle.mockImplementation(() => ++mocks.cycle);
  });

  afterAll(() => {
    if (serviceWorkerDescriptor) {
      Object.defineProperty(navigator, 'serviceWorker', serviceWorkerDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
  });

  it('boots the page on DOMContentLoaded and disposes the previous article on CONTENT_READY', () => {
    const disposeTableOfContents = vi.fn();
    mocks.initTableOfContents.mockReturnValue(disposeTableOfContents);

    const article = document.createElement('article');
    article.id = 'article';
    document.body.append(article);

    let cycleNum = 0;

    document.dispatchEvent(new Event('DOMContentLoaded'));
    cycleNum++;

    expect(mocks.bootSidebar).toHaveBeenCalledWith(article, cycleNum);
    expect(mocks.bootTableOfContents).toHaveBeenCalledWith(article, cycleNum);
    expect(mocks.startupSearch).toHaveBeenCalledWith(article, cycleNum);

    expect(mocks.initTableOfContents).toHaveBeenCalledOnce();

    article.dispatchEvent(new Event('content-ready', { bubbles: true }));
    cycleNum++;

    expect(disposeTableOfContents).toHaveBeenCalledOnce();

    expect(mocks.hiddenSearch).toHaveBeenCalledWith(article, cycleNum);
    expect(mocks.initMark).toHaveBeenCalledWith(article, cycleNum);
    expect(mocks.initTableOfContents).toHaveBeenCalledTimes(cycleNum);
    expect(mocks.prepareForNextCycle).toHaveBeenCalledTimes(cycleNum);

    article.remove();
  });
});
