import type { Disposer } from './types.ts';

import { ELEMENT_MEDIA_SLIDER, ELEMENT_YOUTUBE, ROOT_PATH } from '../constants.ts';

const SELECTOR_MEDIA = `img, video, ${ELEMENT_YOUTUBE}`;

const VARIABLE_SLIDE_WIDTH = '--slide-width';

const CLASS_MEDIA = 'media';
const CLASS_CONTROLS = 'controls';
const CLASS_ARROW = 'arrow';
const CLASS_INDICATORS = 'indicators';
const CLASS_ACTIVE = 'active';

const BUTTON_TEXT_PREV = '◀';
const BUTTON_TEXT_NEXT = '▶';

const SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'nearest',
  inline: 'start',
};

const DEFAULT_MEDIA_WIDTH = 1920;
const YOUTUBE_THUMBNAIL = 'mqdefault.jpg';

type Direction = 'prev' | 'next';
type CompatibleMedia = HTMLImageElement | HTMLVideoElement | HTMLElement;

const extractName = (s: string): string => s.match(/\/([^/?#]+?)(\.[^/.#?]+)?(?:[?#]|$)/)?.[1] ?? '';

const getMediaWidth = (media: CompatibleMedia): number => {
  if (media instanceof HTMLImageElement) {
    return media.naturalWidth;
  }

  if (media instanceof HTMLVideoElement) {
    return media.width;
  }

  if (media.matches(ELEMENT_YOUTUBE)) {
    return DEFAULT_MEDIA_WIDTH;
  }
  return 0;
};

const getThumbnail = (media: CompatibleMedia): string => {
  if (media instanceof HTMLImageElement) {
    return media.src;
  }

  if (media.matches(ELEMENT_YOUTUBE)) {
    const id = media.dataset['id'];
    return id ? `https://img.youtube.com/vi/${id}/${YOUTUBE_THUMBNAIL}` : '';
  }

  return media instanceof HTMLVideoElement ? media.dataset['poster'] || media.poster : '';
};

class MediaSlider extends HTMLElement {
  private mediaContainer: HTMLDivElement;

  private medias: CompatibleMedia[] = [];
  private indicatorButtons: HTMLButtonElement[] = [];

  private abortController: AbortController = new AbortController();
  private observer: IntersectionObserver | undefined;
  private controls: HTMLDivElement | undefined;

  private index = 0;
  private mediaMaxWidth = 0;

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
    const index = ((next % len) + len) % len;

    this.mediaContainer.scrollTo({
      left: this.mediaContainer.clientWidth * index,
      behavior: 'smooth',
    });
  }

  private createArrow(direction: Direction): HTMLDivElement {
    const arrow = document.createElement('div');

    arrow.classList.add(CLASS_ARROW);
    arrow.textContent = direction === 'prev' ? BUTTON_TEXT_PREV : BUTTON_TEXT_NEXT;

    arrow.addEventListener(
      'click',
      (): void => {
        this.scrollToSlide(this.index + (direction === 'prev' ? -1 : 1));
      },
      {
        passive: true,
        signal: this.abortController.signal,
      },
    );

    return arrow;
  }

  private setupVideo(video: HTMLVideoElement): void {
    video.addEventListener(
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

  connectedCallback(): void {
    this.abortController = new AbortController();

    this.medias = Array.from(this.querySelectorAll<CompatibleMedia>(SELECTOR_MEDIA));

    if (this.medias.length === 0) {
      console.warn('No video or image elements found inside the media slider.');
      return;
    }

    this.initializeSlideLayout();

    const controls = document.createElement('div');

    controls.classList.add(CLASS_CONTROLS);
    controls.append(this.createArrow('prev'), this.createIndicators(), this.createArrow('next'));

    this.controls = controls;
    this.shadowRoot?.append(controls);

    this.observer = new IntersectionObserver(this.handleIntersect, {
      root: this.mediaContainer,
      threshold: 0.8,
    });

    for (const x of this.medias) {
      if (x instanceof HTMLVideoElement) {
        this.setupVideo(x);
      }

      this.observer.observe(x);
    }

    this.mediaContainer.scrollLeft = 0;
  }

  disconnectedCallback(): void {
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

  private stopVideo(index: number): void {
    const current = this.medias[index];

    if (current instanceof HTMLVideoElement) {
      current.pause();
    }
  }

  private goTo(next: number): void {
    if (next === this.index) {
      return;
    }

    this.stopVideo(this.index);

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

    for (const x of entries) {
      if (!x.isIntersecting) {
        continue;
      }

      this.goTo(this.medias.indexOf(x.target as CompatibleMedia));

      return;
    }
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

  return () => {};
};
