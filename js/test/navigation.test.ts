// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NavigationContext } from '@/context.ts';

const mocks = vi.hoisted(() => ({
  prepareNavigation: vi.fn(),
  isSame: vi.fn(() => false),
  commit: vi.fn(),
  bootThemeColor: vi.fn(),
  setHTML: vi.fn(),
  toastError: vi.fn(),
  startViewTransition: vi.fn(),
}));

vi.mock('@/constants.ts', () => ({
  CONTENT_READY: 'content-ready',
}));

vi.mock('@/context.ts', () => ({
  prepareNavigation: mocks.prepareNavigation,
}));

vi.mock('@/navigation-store.ts', () => ({
  default: {
    isSame: mocks.isSame,
    commit: mocks.commit,
  },
}));

vi.mock('@/theme-selector.ts', () => ({
  bootThemeColor: mocks.bootThemeColor,
}));

vi.mock('@/utils/html-sanitizer.ts', () => ({
  setHTML: mocks.setHTML,
}));

vi.mock('@/utils/toast.ts', () => ({
  default: {
    error: mocks.toastError,
  },
}));

type InterceptOptions = {
  handler: () => Promise<void>;
  scroll: 'manual' | 'after-transition';
};

type NavigateEventOptions = {
  url: string;
  canIntercept?: boolean;
  downloadRequest?: unknown;
  navigationType?: string;
};

const createNavigateEvent = (options: NavigateEventOptions) => {
  let interceptedOptions: InterceptOptions | undefined;

  const intercept = vi.fn((value: InterceptOptions) => {
    interceptedOptions = value;
  });

  const event = new Event('navigate');

  Object.defineProperties(event, {
    canIntercept: { value: options.canIntercept ?? true },
    downloadRequest: { value: options.downloadRequest ?? null },
    destination: { value: { url: options.url } },
    navigationType: { value: options.navigationType ?? 'push' },
    intercept: { value: intercept },
  });

  return {
    event,
    intercept,
    getInterceptedOptions: () => interceptedOptions,
  };
};

const createContext = (next: URL, titleText = 'Next page', html = '<p>New content</p>'): NavigationContext => {
  const title = document.createElement('title');
  title.textContent = titleText;

  const article = document.createElement('article');
  article.innerHTML = html;

  return { next, title, article } as unknown as NavigationContext;
};

describe('navigation', () => {
  let navigationTarget: EventTarget;
  let frames: FrameRequestCallback[];
  let pageViews: unknown[];
  let startViewTransitionDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    vi.resetModules();

    document.body.replaceChildren();
    document.title = '';

    mocks.prepareNavigation.mockReset();
    mocks.isSame.mockReset();
    mocks.isSame.mockReturnValue(false);
    mocks.commit.mockReset();
    mocks.bootThemeColor.mockReset();
    mocks.bootThemeColor.mockResolvedValue(undefined);
    mocks.setHTML.mockReset();
    mocks.setHTML.mockImplementation((element: HTMLElement, html: string) => {
      element.innerHTML = html;
    });
    mocks.toastError.mockReset();
    mocks.startViewTransition.mockReset();
    mocks.startViewTransition.mockImplementation((callback: () => void) => {
      callback();
      return { updateCallbackDone: Promise.resolve() };
    });

    navigationTarget = new EventTarget();
    vi.stubGlobal('navigation', navigationTarget);

    frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });

    pageViews = [];
    vi.stubGlobal('dataLayer', pageViews);

    startViewTransitionDescriptor = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: mocks.startViewTransition,
    });

    await import('@/navigation.ts');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();

    if (startViewTransitionDescriptor !== undefined) {
      Object.defineProperty(document, 'startViewTransition', startViewTransitionDescriptor);
    } else {
      Reflect.deleteProperty(document, 'startViewTransition');
    }
  });

  it('registers the navigate listener and boots the theme color', () => {
    expect(mocks.bootThemeColor).toHaveBeenCalledOnce();

    // Importing the module registers the listener. Dispatching a non-interceptable
    // event confirms the listener is active without starting navigation.
    const { event, intercept } = createNavigateEvent({
      url: 'https://example.test/next',
      canIntercept: false,
    });

    navigationTarget.dispatchEvent(event);

    expect(intercept).not.toHaveBeenCalled();
  });

  it('applies a push navigation, records a page view, and scrolls to the article', async () => {
    const next = new URL('https://example.test/next');
    const context = createContext(next, 'Next page');
    mocks.prepareNavigation.mockResolvedValue(context);

    const liveArticle = document.createElement('article');
    liveArticle.id = 'article';

    const scrollIntoView = vi.fn();
    Object.defineProperty(liveArticle, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    const contentReady = vi.fn();
    liveArticle.addEventListener('content-ready', contentReady);
    document.body.append(liveArticle);

    const { event, intercept, getInterceptedOptions } = createNavigateEvent({
      url: next.href,
    });

    navigationTarget.dispatchEvent(event);

    expect(intercept).toHaveBeenCalledOnce();
    expect(getInterceptedOptions()?.scroll).toBe('manual');

    const intercepted = getInterceptedOptions();
    expect(intercepted).toBeDefined();
    await intercepted!.handler();

    expect(mocks.prepareNavigation).toHaveBeenCalledWith(next);
    expect(mocks.startViewTransition).toHaveBeenCalledOnce();
    expect(mocks.setHTML).toHaveBeenCalledWith(liveArticle, context.article.innerHTML);
    expect(liveArticle.innerHTML).toBe('<p>New content</p>');
    expect(document.title).toBe('Next page');
    expect(contentReady).toHaveBeenCalledOnce();

    expect(pageViews).toContainEqual({
      event: 'page_view',
      page_path: '/next',
      page_title: 'Next page',
    });

    expect(frames).toHaveLength(1);
    frames.shift()?.(0);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    expect(mocks.commit).toHaveBeenCalledWith(next);
  });

  it('does not record a page view or schedule scrolling for a traverse navigation', async () => {
    const next = new URL('https://example.test/previous');
    const liveArticle = document.createElement('article');
    liveArticle.id = 'article';
    document.body.append(liveArticle);

    mocks.prepareNavigation.mockResolvedValue(createContext(next));

    const { event, getInterceptedOptions } = createNavigateEvent({
      url: next.href,
      navigationType: 'traverse',
    });

    navigationTarget.dispatchEvent(event);

    expect(getInterceptedOptions()?.scroll).toBe('after-transition');

    const intercepted = getInterceptedOptions();
    expect(intercepted).toBeDefined();
    await intercepted!.handler();

    expect(pageViews).toHaveLength(0);
    expect(frames).toHaveLength(0);
    expect(mocks.commit).toHaveBeenCalledWith(next);
  });

  it('does not intercept non-interceptable, download, or same-page navigations', () => {
    const nonInterceptable = createNavigateEvent({
      url: 'https://example.test/one',
      canIntercept: false,
    });

    const download = createNavigateEvent({
      url: 'https://example.test/file.zip',
      downloadRequest: 'file.zip',
    });

    mocks.isSame.mockReturnValue(true);
    const samePage = createNavigateEvent({
      url: 'https://example.test/current',
    });

    navigationTarget.dispatchEvent(nonInterceptable.event);
    navigationTarget.dispatchEvent(download.event);
    navigationTarget.dispatchEvent(samePage.event);

    expect(nonInterceptable.intercept).not.toHaveBeenCalled();
    expect(download.intercept).not.toHaveBeenCalled();
    expect(samePage.intercept).not.toHaveBeenCalled();
    expect(mocks.prepareNavigation).not.toHaveBeenCalled();
  });

  it('reports an error when navigation preparation returns no context', async () => {
    const next = new URL('https://example.test/missing');
    mocks.prepareNavigation.mockResolvedValue(null);

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { event, getInterceptedOptions } = createNavigateEvent({
      url: next.href,
    });

    navigationTarget.dispatchEvent(event);

    const intercepted = getInterceptedOptions();
    expect(intercepted).toBeDefined();
    await intercepted!.handler();

    expect(mocks.toastError).toHaveBeenCalledWith(`failed: ${next.href}`);
    expect(consoleError).toHaveBeenCalledWith('prepareNavigation: The necessary elements are missing.');
    expect(mocks.startViewTransition).not.toHaveBeenCalled();
    expect(mocks.commit).not.toHaveBeenCalled();
  });
});
