import { ELEMENT_MEDIA_SLIDER, ELEMENT_YOUTUBE } from './element.ts';
import type { Disposer } from './types.ts';

import { ROOT_PATH } from '../constants.ts';

const SELECTOR_MEDIA = `img, video, ${ELEMENT_YOUTUBE}`;

const VARIABLE_SLIDE_WIDTH = '--slide-width';

const CLASS_MEDIA = 'media';
const CLASS_CONTROLS = 'controls';
const CLASS_INDICATORS = 'indicators';
const CLASS_ACTIVE = 'active';

const SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'nearest',
  inline: 'start',
};

const YOUTUBE_THUMBNAIL = 'mqdefault.jpg';

type CompatibleMedia = HTMLImageElement | HTMLVideoElement | HTMLElement;

interface YouTubeMediaElement extends HTMLElement {
  pauseVideo(): void;
}

const extractName = (s: string): string => s.match(/\/([^/?#]+?)(\.[^/.#?]+)?(?:[?#]|$)/)?.[1] ?? '';
const isYouTubeMedia = (media: CompatibleMedia): media is YouTubeMediaElement => media.matches(ELEMENT_YOUTUBE);

const getMediaWidth = (media: CompatibleMedia): number => {
  if (media instanceof HTMLImageElement) {
    return media.naturalWidth;
  }

  if (media instanceof HTMLVideoElement) {
    return media.width;
  }

  if (isYouTubeMedia(media)) {
    return media.getBoundingClientRect().width;
  }

  return 0;
};

const getThumbnail = (media: CompatibleMedia): string => {
  if (media instanceof HTMLImageElement) {
    return media.src;
  }

  if (isYouTubeMedia(media)) {
    const id = media.dataset['id'];
    return id ? `https://img.youtube.com/vi/${id}/${YOUTUBE_THUMBNAIL}` : '';
  }

  return media instanceof HTMLVideoElement ? media.dataset['poster'] || media.poster : '';
};

class MediaSlider extends HTMLElement {
  private mediaContainer: HTMLDivElement;

  private medias: CompatibleMedia[] = [];
  private indicatorButtons: HTMLButtonElement[] = [];

  private abortController = new AbortController();
  private observer: IntersectionObserver | undefined;
  private controls: HTMLDivElement | undefined;

  private index = 0;
  private mediaMaxWidth = 0;

  private visibilityObserver: IntersectionObserver | undefined;

  constructor() {
    super();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('media-slider.css', `${ROOT_PATH}css/`).href;

    const media = document.createElement('div');
    media.classList.add(CLASS_MEDIA);

    const slot = document.createElement('slot');
    media.append(slot);

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(link, media);

    this.mediaContainer = media;
  }

  private scrollToSlide(next: number): void {
    if (document.fullscreenElement) {
      return;
    }

    const len = this.medias.length;

    if (len === 0) {
      return;
    }

    const index = ((next % len) + len) % len;
    const media = this.medias[index];

    if (media === undefined) {
      return;
    }

    media.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
  }

  private setupMedia(media: HTMLVideoElement | YouTubeMediaElement): void {
    media.addEventListener(
      'ended',
      () => {
        this.scrollToSlide(this.index + 1);
      },
      {
        passive: true,
        signal: this.abortController.signal,
      },
    );
  }

  private createSlider(): void {
    this.abortController = new AbortController();
    this.medias = Array.from(this.querySelectorAll<CompatibleMedia>(SELECTOR_MEDIA));

    if (this.medias.length === 0) {
      console.warn('No video or image elements found inside the media slider.');
      return;
    }

    this.initializeSlideLayout();

    const controls = document.createElement('div');
    controls.classList.add(CLASS_CONTROLS);
    controls.append(this.createIndicators());

    this.controls = controls;
    this.shadowRoot?.append(controls);

    this.observer = new IntersectionObserver(this.handleIntersect, {
      root: this.mediaContainer,
      threshold: 0.8,
    });

    for (const x of this.medias) {
      if (x instanceof HTMLVideoElement || isYouTubeMedia(x)) {
        this.setupMedia(x);
      }

      this.observer.observe(x);
    }

    // Ensure the slider starts from the first item.
    this.mediaContainer.scrollLeft = 0;
  }

  connectedCallback(): void {
    this.visibilityObserver = new IntersectionObserver(
      entries => {
        if (!this.isConnected || !entries.some(entry => entry.isIntersecting)) {
          return;
        }

        this.visibilityObserver?.disconnect();
        this.visibilityObserver = undefined;

        this.createSlider();
      },
      {
        rootMargin: '80% 0%',
      },
    );

    this.visibilityObserver.observe(this);
  }

  disconnectedCallback(): void {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;

    this.observer?.disconnect();
    this.observer = undefined;

    this.abortController.abort();

    this.controls?.remove();
    this.controls = undefined;

    this.medias = [];
    this.indicatorButtons = [];

    this.index = 0;
    this.mediaMaxWidth = 0;

    this.mediaContainer.style.removeProperty(VARIABLE_SLIDE_WIDTH);
  }

  private updateSlideWidth(): void {
    const width = Math.max(...this.medias.map(getMediaWidth), 0);

    if (width === this.mediaMaxWidth) {
      return;
    }

    this.mediaContainer.style.setProperty(VARIABLE_SLIDE_WIDTH, `${width}px`);
    this.mediaMaxWidth = width;
  }

  private initializeSlideLayout(): void {
    this.updateSlideWidth();

    // Account for images that have not finished loading yet.
    for (const x of this.medias) {
      if (!(x instanceof HTMLImageElement) || x.complete) {
        continue;
      }

      x.addEventListener('load', () => this.updateSlideWidth(), {
        once: true,
        passive: true,
        signal: this.abortController.signal,
      });
    }
  }

  private stopMedia(index: number): void {
    const current = this.medias[index];

    if (current instanceof HTMLVideoElement) {
      current.pause();
    } else if (current !== undefined && isYouTubeMedia(current)) {
      current.pauseVideo();
    }
  }

  private goTo(next: number): void {
    if (next === this.index) {
      return;
    }

    this.stopMedia(this.index);

    const nextButton = this.indicatorButtons[next];
    const currentButton = this.indicatorButtons[this.index];

    if (!nextButton || !currentButton) {
      return;
    }

    nextButton.classList.add(CLASS_ACTIVE);
    currentButton.classList.remove(CLASS_ACTIVE);

    this.index = next;
  }

  private handleIntersect = (entries: IntersectionObserverEntry[]): void => {
    if (document.fullscreenElement) {
      return;
    }

    const entry = entries
      .filter(x => x.isIntersecting && x.intersectionRatio >= 0.8)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (entry === undefined) {
      return;
    }

    const index = this.medias.indexOf(entry.target as CompatibleMedia);

    if (index < 0) {
      return;
    }

    this.goTo(index);
  };

  private createIndicators(): HTMLDivElement {
    const indicators = document.createElement('div');
    const fragment = document.createDocumentFragment();

    indicators.classList.add(CLASS_INDICATORS);

    for (const x of this.medias) {
      const button = document.createElement('button');
      const thumbnail = getThumbnail(x);

      button.type = 'button';
      button.ariaLabel = `Slide: ${extractName(thumbnail)}`;
      button.style.backgroundImage = `url('${thumbnail}')`;

      button.addEventListener(
        'click',
        (): void => {
          x.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
        },
        {
          passive: true,
          signal: this.abortController.signal,
        },
      );

      fragment.append(button);
      this.indicatorButtons.push(button);
    }

    const firstButton = this.indicatorButtons[0];

    if (!firstButton) {
      throw new Error('createIndicators: Index 0 is invalid');
    }

    firstButton.classList.add(CLASS_ACTIVE);
    indicators.append(fragment);

    return indicators;
  }
}

const registry = (name: string): void => {
  if (customElements.get(name) !== undefined) {
    return;
  }

  customElements.define(name, MediaSlider);
};

export const initialize = (_html: HTMLElement): Disposer => {
  registry(ELEMENT_MEDIA_SLIDER);

  return () => {}; // no-op dispose
};
