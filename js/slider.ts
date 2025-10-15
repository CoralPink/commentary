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

  private observer = new IntersectionObserver(this.handleIntersect, { threshold: 0.8 });

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

    this.addVideoEvent();

    for (const x of Array.from(this.medias)) {
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

    this.indicatorSpans[next]!.classList.add(CLASS_ACTIVE);
    this.indicatorSpans[this.index]!.classList.remove(CLASS_ACTIVE);

    this.index = next;
  }

  private createIndicators(): HTMLElement {
    const fragment = document.createDocumentFragment();

    for (const media of this.medias) {
      const button = document.createElement('button');

      const thumbnail =
        media instanceof HTMLVideoElement
          ? media.dataset.poster || media.poster || ''
          : (media as HTMLImageElement).src;

      button.style.backgroundImage = `url('${thumbnail}')`;

      const fileName = thumbnail.match(/\/([^\/?#]+?)(\.[^\/.#?]+)?(?:[?#]|$)/)?.[1] ?? '';
      button.setAttribute('aria-label', fileName);

      button.addEventListener(
        'click',
        (): void => {
          media!.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
        },
        { once: false, passive: true },
      );

      fragment.appendChild(button);
      this.indicatorSpans.push(button);
    }

    this.indicatorSpans[0]!.classList.add(CLASS_ACTIVE);

    const indicators = document.createElement('div');

    indicators.setAttribute('id', ID_INDICATORS);
    indicators.appendChild(fragment);

    return indicators;
  }

  private scrollTo(next: number): void {
    const len = this.medias.length;
    const idx = ((next % len) + len) % len; // Index values are looped.

    this.medias[idx]!.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
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

  private addVideoEvent(): void {
    for (const item of this.medias) {
      if (!(item instanceof HTMLVideoElement)) {
        continue;
      }

      item.addEventListener('ended', (): void => {
        this.scrollTo(this.index + 1);

        // Most of the videos on this site start with a fade-in,
        // so unless you intentionally shift the starting position, they are all black...!
        item.currentTime = 0.5;
      });
    }
  }
}

const initialize = (): void => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const x of entries) {
        if (!x.isIntersecting) {
          continue;
        }

        new Slider(x.target as HTMLDivElement);
        obs.unobserve(x.target);
      }
    },
    { rootMargin: '3%' },
  );

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
