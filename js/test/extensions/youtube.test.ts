// @vitest-environment happy-dom

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ELEMENT_YOUTUBE } from '@/extensions/element.ts';
import { initialize } from '@/extensions/youtube.ts';

const mocks = vi.hoisted(() => ({
  playerConstruct: vi.fn(),
  playerDestroy: vi.fn(),
}));

type TestPlayerOptions = {
  videoId: string;
  playerVars: {
    autoplay: 0;
    origin: string;
    playsinline: 0;
    rel: 0;
  };
  events: {
    onStateChange(event: { data: number }): void;
  };
};

const ENDED = 5;

const createYouTubeApi = () => ({
  PlayerState: { ENDED },
  Player: class {
    constructor(element: HTMLElement, options: TestPlayerOptions) {
      mocks.playerConstruct(element, options);
    }

    destroy(): void {
      mocks.playerDestroy();
    }
  },
});

const setYouTubeApi = (): void => {
  Object.defineProperty(window, 'YT', {
    configurable: true,
    value: createYouTubeApi(),
  });
};

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

class FakeIntersectionObserver {
  private target: Element | undefined;
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
    observers.push(this);
  }

  observe = vi.fn((target: Element): void => {
    this.target = target;
  });

  disconnect = vi.fn();

  trigger(isIntersecting = true): void {
    if (this.target === undefined) {
      throw new Error('No target has been observed');
    }

    this.callback(
      [{ isIntersecting, target: this.target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

let observers: FakeIntersectionObserver[] = [];
let ytDescriptor: PropertyDescriptor | undefined;
let callbackDescriptor: PropertyDescriptor | undefined;

const createVideo = (id?: string): HTMLElement => {
  const video = document.createElement(ELEMENT_YOUTUBE);

  if (id !== undefined) {
    video.setAttribute('data-id', id);
  }

  document.body.append(video);

  return video;
};

describe('YouTubeVideo', () => {
  beforeAll(() => {
    initialize(document.body);
  });

  beforeEach(() => {
    observers = [];

    mocks.playerConstruct.mockClear();
    mocks.playerDestroy.mockClear();

    ytDescriptor = Object.getOwnPropertyDescriptor(window, 'YT');
    callbackDescriptor = Object.getOwnPropertyDescriptor(window, 'onYouTubeIframeAPIReady');

    Reflect.deleteProperty(window, 'YT');
    Reflect.deleteProperty(window, 'onYouTubeIframeAPIReady');

    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    document.body.replaceChildren();

    document.head.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]').forEach(script => {
      script.remove();
    });

    vi.restoreAllMocks();
    vi.unstubAllGlobals();

    if (ytDescriptor !== undefined) {
      Object.defineProperty(window, 'YT', ytDescriptor);
    } else {
      Reflect.deleteProperty(window, 'YT');
    }

    if (callbackDescriptor !== undefined) {
      Object.defineProperty(window, 'onYouTubeIframeAPIReady', callbackDescriptor);
    } else {
      Reflect.deleteProperty(window, 'onYouTubeIframeAPIReady');
    }
  });

  afterAll(() => {
    document.body.replaceChildren();
  });

  it('waits until the element intersects and warns when the video ID is missing', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const video = createVideo();

    expect(observers).toHaveLength(1);
    expect(observers[0]?.observe).toHaveBeenCalledWith(video);
    expect(document.querySelector('script[src="https://www.youtube.com/iframe_api"]')).toBeNull();

    observers[0]?.trigger();

    expect(observers[0]?.disconnect).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledWith('youtube id missing');
    expect(video.shadowRoot?.querySelector('div')).toBeNull();
  });

  it('removes the mount and logs an error when the API script fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const video = createVideo('video-1');

    observers[0]?.trigger();

    const script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');

    expect(script).not.toBeNull();
    expect(video.shadowRoot?.querySelector('div')).not.toBeNull();

    script?.dispatchEvent(new Event('error'));
    await flushPromises();

    expect(error).toHaveBeenCalledWith('YouTube Player API initialization failed', expect.any(Error));
    expect(video.shadowRoot?.querySelector('div')).toBeNull();
    expect(mocks.playerConstruct).not.toHaveBeenCalled();
  });

  it('does not create a player if the element disconnects while the API is loading', async () => {
    const video = createVideo('video-2');

    observers[0]?.trigger();

    const readyCallback = window.onYouTubeIframeAPIReady;
    expect(readyCallback).toBeTypeOf('function');

    video.remove();
    expect(video.shadowRoot?.querySelector('div')).toBeNull();

    setYouTubeApi();
    readyCallback?.();
    await flushPromises();

    expect(mocks.playerConstruct).not.toHaveBeenCalled();
    expect(video.shadowRoot?.querySelector('div')).toBeNull();
  });

  it('creates a player when visible, dispatches ended, and destroys the player on disconnect', async () => {
    setYouTubeApi();

    const video = createVideo('video-3');
    const ended = vi.fn();
    video.addEventListener('ended', ended);

    expect(mocks.playerConstruct).not.toHaveBeenCalled();

    observers[0]?.trigger();
    await flushPromises();

    expect(mocks.playerConstruct).toHaveBeenCalledOnce();

    const [mount, options] = mocks.playerConstruct.mock.calls[0] as [HTMLElement, TestPlayerOptions];

    expect(mount).toBe(video.shadowRoot?.querySelector('div'));
    expect(options.videoId).toBe('video-3');
    expect(options.playerVars.autoplay).toBe(0);
    expect(options.playerVars.playsinline).toBe(0);
    expect(options.playerVars.rel).toBe(0);

    options.events.onStateChange({ data: ENDED });
    expect(ended).toHaveBeenCalledOnce();

    video.remove();

    expect(mocks.playerDestroy).toHaveBeenCalledOnce();
    expect(video.shadowRoot?.querySelector('div')).toBeNull();
    expect(observers[0]?.disconnect).toHaveBeenCalledOnce();
  });
});
