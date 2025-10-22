import { setPlyr } from './media.ts';

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

type Direction = typeof ID_PREV | typeof ID_NEXT;
type CompatibleMedia = HTMLVideoElement | HTMLImageElement;

const extractName = (s: string): string => s.match(/\/([^/?#]+?)(\.[^/.#?]+)?(?:[?#]|$)/)?.[1] ?? '';

class Slider {
  private medias: CompatibleMedia[] = [];
  private indicatorSpans: HTMLSpanElement[] = [];

  private index = 0;

  private handleIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.goTo(this.medias.indexOf(entry.target as CompatibleMedia));
        return;
      }
    }
  };

  private observer = new IntersectionObserver(this.handleIntersect, {
    threshold: 0.8,
  });

  constructor(slider: HTMLDivElement) {
    const mediaContainer = slider.querySelector<HTMLDivElement>('.media');

    if (!mediaContainer) {
      console.warn('The media container corresponding to slider class is not found.');
      return;
    }

    this.medias = Array.from(mediaContainer.querySelectorAll<CompatibleMedia>('video, img'));

    if (this.medias.length === 0) {
      console.warn('No video or image elements found inside the media container.');
      return;
    }

    const indicators = this.createIndicators();

    const fragment = document.createDocumentFragment();
    const controls = document.createElement('div');

    controls.classList.add(CLASS_CONTROLS);

    controls.appendChild(this.createArrow(ID_PREV));
    controls.appendChild(indicators);
    controls.appendChild(this.createArrow(ID_NEXT));

    fragment.appendChild(controls);
    slider.appendChild(fragment);

    for (const x of Array.from(this.medias)) {
      if (x instanceof HTMLVideoElement) {
        this.setupVideo(x);
      }

      this.observer.observe(x);
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

  private createIndicators(): HTMLElement {
    const fragment = document.createDocumentFragment();

    for (const media of this.medias) {
      const button = document.createElement('button');

      const thumbnail =
        media instanceof HTMLVideoElement
          ? media.dataset['poster' as keyof DOMStringMap] || media.poster || ''
          : (media as HTMLImageElement).src;

      button.style.backgroundImage = `url('${thumbnail}')`;
      button.setAttribute('aria-label', `Slide: ${extractName(thumbnail)}`);

      button.addEventListener(
        'click',
        (): void => {
          media.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
        },
        { once: false, passive: true },
      );

      fragment.appendChild(button);
      this.indicatorSpans.push(button);
    }

    if (!this.indicatorSpans[0]) {
      throw new Error('createIndicators: Index 0 is invalid');
    }
    this.indicatorSpans[0].classList.add(CLASS_ACTIVE);

    const indicators = document.createElement('div');

    indicators.setAttribute('id', ID_INDICATORS);
    indicators.appendChild(fragment);

    return indicators;
  }

  private scrollTo(next: number): void {
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
      { once: false, passive: true },
    );

    return arrow;
  }

  private setupVideo(video: HTMLVideoElement): void {
    setPlyr(video);

    video.addEventListener('ended', (): void => {
      this.scrollTo(this.index + 1);
    });
  }
}

const setupSlider = (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
  for (const x of entries) {
    if (!x.isIntersecting) {
      continue;
    }

    new Slider(x.target as HTMLDivElement);
    obs.unobserve(x.target);
  }
};

const initialize = (): void => {
  const observer = new IntersectionObserver(setupSlider, { rootMargin: '5%' });

  for (const elm of Array.from(document.querySelectorAll<HTMLDivElement>('.slider'))) {
    observer.observe(elm);
  }
};

(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
    return;
  }

  initialize();
})();
