import type { Disposer } from './types.ts';

const CLASS_ARROW = 'arrow';
const CLASS_CONTROLS = 'controls';

const CLASS_ACTIVE = 'active';

const ID_INDICATORS = 'indicators';

const ID_PREV = 'prev';
const ID_NEXT = 'next';

const BUTTON_TEXT_PREV = '◀';
const BUTTON_TEXT_NEXT = '▶';

const SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'nearest',
  inline: 'start',
};

const VARIABLES_SLIDE_WIDTH = '--slide-width';

type Direction = typeof ID_PREV | typeof ID_NEXT;
type CompatibleMedia = HTMLVideoElement | HTMLImageElement;

const extractName = (s: string): string => s.match(/\/([^/?#]+?)(\.[^/.#?]+)?(?:[?#]|$)/)?.[1] ?? '';

const getMediaWidth = (media: CompatibleMedia): number =>
  media instanceof HTMLImageElement ? media.naturalWidth : media.width;

const getThumbnail = (media: CompatibleMedia): string => {
  if (media instanceof HTMLImageElement) {
    return media.src;
  }

  return media.dataset['poster' as keyof DOMStringMap] || media.poster || '';
};

class Slider {
  private medias: CompatibleMedia[] = [];
  private indicatorSpans: HTMLSpanElement[] = [];

  private abortListener = new AbortController();

  private observer?: IntersectionObserver;
  private index = 0;

  private mediaMaxWidth = 0;

  constructor(slider: HTMLDivElement) {
    const mediaContainer = slider.querySelector<HTMLDivElement>('.media');

    if (mediaContainer === null) {
      console.warn('The media container corresponding to slider class is not found.');
      return;
    }

    this.medias = Array.from(mediaContainer.querySelectorAll<CompatibleMedia>('video, img'));

    if (this.medias.length === 0) {
      console.warn('No video or image elements found inside the media container.');
      return;
    }

    this.initializeSlideLayout(mediaContainer);

    const fragment = document.createDocumentFragment();
    const controls = document.createElement('div');

    controls.classList.add(CLASS_CONTROLS);
    controls.append(this.createArrow(ID_PREV), this.createIndicators(), this.createArrow(ID_NEXT));

    fragment.append(controls);
    slider.append(fragment);

    this.observer = new IntersectionObserver(this.handleIntersect, {
      root: mediaContainer,
      threshold: 0.8,
    });

    for (const x of Array.from(this.medias)) {
      if (x instanceof HTMLVideoElement) {
        this.setupVideo(x);
      }

      this.observer.observe(x);
    }

    // Ensure the slider starts from the first item.
    mediaContainer.scrollLeft = 0;
  }

  private updateSlideWidth(container: HTMLDivElement): void {
    const width = Math.max(...this.medias.map(getMediaWidth), 0);

    if (width === this.mediaMaxWidth) {
      return;
    }

    container.style.setProperty(VARIABLES_SLIDE_WIDTH, `${width}px`);
    this.mediaMaxWidth = width;
  }

  private initializeSlideLayout(container: HTMLDivElement): void {
    this.updateSlideWidth(container);

    // Take into account cases where the image has not finished loading
    for (const x of this.medias) {
      if (!(x instanceof HTMLImageElement) || x.complete) {
        continue;
      }

      x.addEventListener('load', () => this.updateSlideWidth(container), {
        once: true,
        passive: true,
        signal: this.abortListener.signal,
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

    const nextSpan = this.indicatorSpans[next];
    const currentSpan = this.indicatorSpans[this.index];

    if (!nextSpan || !currentSpan) {
      return;
    }

    nextSpan.classList.add(CLASS_ACTIVE);
    currentSpan.classList.remove(CLASS_ACTIVE);

    this.index = next;
  }

  private handleIntersect = (entries: IntersectionObserverEntry[]) => {
    if (document.fullscreenElement) {
      return;
    }

    for (const x of entries) {
      if (x.isIntersecting) {
        this.goTo(this.medias.indexOf(x.target as CompatibleMedia));
        return;
      }
    }
  };

  private createIndicators(): HTMLElement {
    const fragment = document.createDocumentFragment();

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
        { passive: true, signal: this.abortListener.signal },
      );

      fragment.appendChild(button);
      this.indicatorSpans.push(button);
    }

    if (!this.indicatorSpans[0]) {
      throw new Error('createIndicators: Index 0 is invalid');
    }
    this.indicatorSpans[0].classList.add(CLASS_ACTIVE);

    const indicators = document.createElement('div');

    indicators.id = ID_INDICATORS;
    indicators.append(fragment);

    return indicators;
  }

  private scrollTo(next: number): void {
    if (document.fullscreenElement) {
      return;
    }

    const len = this.medias.length;
    const idx = ((next % len) + len) % len; // Index values are looped.

    if (!this.medias[idx]) {
      console.error(`scrollTo: The index ${idx} is invalid`);
      return;
    }

    this.medias[idx].scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
  }

  private createArrow(dir: Direction): HTMLElement {
    const arrow = document.createElement('div');

    arrow.classList.add(CLASS_ARROW);
    arrow.id = dir;
    arrow.textContent = dir === ID_PREV ? BUTTON_TEXT_PREV : BUTTON_TEXT_NEXT;

    arrow.addEventListener(
      'click',
      (): void => {
        this.scrollTo(this.index + (dir === ID_PREV ? -1 : 1));
      },
      { passive: true, signal: this.abortListener.signal },
    );

    return arrow;
  }

  private setupVideo(video: HTMLVideoElement): void {
    video.addEventListener(
      'ended',
      () => {
        this.scrollTo(this.index + 1);
      },
      {
        passive: true,
        signal: this.abortListener.signal,
      },
    );
  }

  public dispose(): void {
    this.observer?.disconnect();
    this.abortListener.abort();

    for (const x of this.indicatorSpans) {
      x.replaceWith(x.cloneNode(true));
    }

    this.medias = [];
    this.indicatorSpans = [];
  }
}

export const initialize = (html: HTMLElement): Disposer => {
  const sliders: Slider[] = [];

  const setupSlider = (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
    for (const x of entries) {
      if (!x.isIntersecting) {
        continue;
      }

      sliders.push(new Slider(x.target as HTMLDivElement));
      obs.unobserve(x.target);
    }
  };

  const obs = new IntersectionObserver(setupSlider, { rootMargin: '15% 0%' });

  for (const elm of Array.from(html.querySelectorAll<HTMLDivElement>('.slider'))) {
    obs.observe(elm);
  }

  return (): void => {
    obs.disconnect();

    for (const x of sliders) {
      x.dispose();
    }
    sliders.length = 0;
  };
};
