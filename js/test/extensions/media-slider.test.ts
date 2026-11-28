// @vitest-environment happy-dom

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ELEMENT_MEDIA_SLIDER } from '@/extensions/element.ts';
import { initialize } from '@/extensions/media-slider.ts';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  private targets: Element[] = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe = vi.fn((target: Element): void => {
    this.targets.push(target);
  });

  disconnect = vi.fn();

  trigger(target = this.targets[0], isIntersecting = true): void {
    if (!target) throw new Error('No target has been observed');
    this.callback([{ isIntersecting, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('MediaSlider', () => {
  beforeAll(() => {
    initialize(document.body);
  });

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('dispatches media-stop to the previous video when the active slide changes', () => {
    const slider = document.createElement(ELEMENT_MEDIA_SLIDER);
    const video = document.createElement('video');
    const image = document.createElement('img');
    const pause = vi.fn();
    const scrollIntoView = vi.fn();
    video.pause = pause;
    video.poster = 'video-poster.jpg';
    image.src = 'image.jpg';
    image.scrollIntoView = scrollIntoView;
    slider.append(video, image);
    document.body.append(slider);

    // The first observer lazily initializes the slider and installs its media observers.
    FakeIntersectionObserver.instances[0]?.trigger();
    const mediaObserver = FakeIntersectionObserver.instances[1];
    expect(mediaObserver?.observe).toHaveBeenCalledTimes(2);

    // Intersecting the second slide changes the active slide and stops the first.
    mediaObserver?.trigger(image);
    expect(pause).toHaveBeenCalledOnce();
  });

  it('creates controls and indicators with media thumbnails', () => {
    const slider = document.createElement(ELEMENT_MEDIA_SLIDER);
    const image = document.createElement('img');
    image.src = 'https://example.test/photos/summer.jpg';
    slider.append(image);
    document.body.append(slider);

    FakeIntersectionObserver.instances[0]?.trigger();

    const shadow = slider.shadowRoot;
    expect(shadow?.querySelector('.controls')).not.toBeNull();
    expect(shadow?.querySelectorAll('.arrow')).toHaveLength(2);
    const indicator = shadow?.querySelector<HTMLButtonElement>('.indicators button');
    expect(indicator?.ariaLabel).toBe('Slide: summer');
    expect(indicator?.style.backgroundImage).toContain('summer.jpg');
    expect(indicator?.classList.contains('active')).toBe(true);
  });

  it('scrolls with arrows and indicator clicks, and advances after video ends', () => {
    const slider = document.createElement(ELEMENT_MEDIA_SLIDER);
    const video = document.createElement('video');
    const image = document.createElement('img');
    video.poster = 'https://example.test/posters/clip.jpg';
    image.src = 'https://example.test/photos/next.jpg';
    const scrollIntoView = vi.fn();
    image.scrollIntoView = scrollIntoView;
    slider.append(video, image);
    document.body.append(slider);

    FakeIntersectionObserver.instances[0]?.trigger();

    const mediaContainer = slider.shadowRoot?.querySelector<HTMLDivElement>('.media');
    const scrollTo = vi.fn();
    if (!mediaContainer) throw new Error('Media container was not created');
    mediaContainer.scrollTo = scrollTo;
    Object.defineProperty(mediaContainer, 'clientWidth', { configurable: true, value: 400 });

    slider.shadowRoot?.querySelector<HTMLElement>('.arrow:last-child')?.click();
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'smooth' });

    // The video ending requests the next slide as well.
    video.dispatchEvent(new Event('ended'));
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'smooth' });

    slider.shadowRoot?.querySelector<HTMLButtonElement>('.indicators button:nth-child(2)')?.click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  });

  it('does not navigate while a document is in fullscreen and cleans up on disconnect', () => {
    const slider = document.createElement(ELEMENT_MEDIA_SLIDER);
    const image = document.createElement('img');
    image.src = 'image.jpg';
    slider.append(image);
    document.body.append(slider);
    FakeIntersectionObserver.instances[0]?.trigger();

    const mediaContainer = slider.shadowRoot?.querySelector<HTMLDivElement>('.media');
    const scrollTo = vi.fn();
    if (!mediaContainer) throw new Error('Media container was not created');
    mediaContainer.scrollTo = scrollTo;
    const fullscreenElement = document.createElement('div');
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: fullscreenElement });

    slider.shadowRoot?.querySelector<HTMLElement>('.arrow:last-child')?.click();
    expect(scrollTo).not.toHaveBeenCalled();

    slider.remove();
    expect(FakeIntersectionObserver.instances[0]?.disconnect).toHaveBeenCalledOnce();
    expect(FakeIntersectionObserver.instances[1]?.disconnect).toHaveBeenCalledOnce();
    expect(slider.shadowRoot?.querySelector('.controls')).toBeNull();

    Reflect.deleteProperty(document, 'fullscreenElement');
  });
});
