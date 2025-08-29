const CLASS_ARROW = 'arrow';
const CLASS_CONTROLS = 'controls';

const ID_INDICATORS = 'indicators';

const ID_PREV = 'prev';
const ID_NEXT = 'next';

const BUTTON_TEXT_PREV = '◀';
const BUTTON_TEXT_NEXT = '▶';

type Direction = typeof ID_PREV | typeof ID_NEXT;
type CompatibleMedia = HTMLVideoElement | HTMLImageElement;

class Slider {
  private medias: CompatibleMedia[] = [];
  private indicatorSpans: HTMLSpanElement[] = [];

  private index = 0;

  private handleIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.goTo(this.medias.indexOf(entry.target as CompatibleMedia), false);
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

    const controls = document.createElement('div');
    controls.classList.add(CLASS_CONTROLS);

    controls.appendChild(this.createArrow(ID_PREV));
    controls.appendChild(indicators);
    controls.appendChild(this.createArrow(ID_NEXT));

    slider.appendChild(controls);

    this.addVideoEvent();

    for (const x of Array.from(this.medias)) {
      this.observer.observe(x);
    }
  }

  private calcIndex(next: number): number {
    const len = this.medias.length;

    return (next % len + len) % len; // Index values are looped.
  };

  private stopVideo(index: number): void {
    const current = this.medias[index];

    if (current instanceof HTMLVideoElement) {
      current.pause();
    }
  }

  private goTo(next: number, scrollInto: boolean = true): void {
    const idx = this.calcIndex(next);

    if (idx === this.index) {
      return;
    }

    this.stopVideo(this.index);

    if (scrollInto) {
      this.medias[idx]!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    this.indicatorSpans[idx]!.classList.add('active');
    this.indicatorSpans[this.index]!.classList.remove('active');

    this.index = idx;
  }

  private createIndicators(): HTMLElement {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.medias.length; i++) {
      const elm = document.createElement('span');
      elm.addEventListener('click', () => { this.goTo(i); }, { once: false, passive: true });

      fragment.appendChild(elm);
      this.indicatorSpans.push(elm);
    }

    this.indicatorSpans[0]!.classList.add('active');

    const indicators = document.createElement('div');

    indicators.setAttribute('id', ID_INDICATORS);
    indicators.appendChild(fragment);

    return indicators;
  }

  private createArrow(dir: Direction): HTMLElement {
    const arrow = document.createElement('div');

    arrow.classList.add(CLASS_ARROW);
    arrow.id = dir;
    arrow.textContent = dir === ID_PREV ? BUTTON_TEXT_PREV : BUTTON_TEXT_NEXT;

    arrow.addEventListener('click', () => {
      this.goTo(this.index + (dir === ID_PREV ? -1 : 1))
    }, { once: false, passive: true });

    return arrow;
  }

  private addVideoEvent(): void {
    for (const item of this.medias) {
      if (!(item instanceof HTMLVideoElement)) {
        continue;
      }

      item.addEventListener('ended', () => {
        this.goTo(this.index + 1);

        // Most of the videos on this site start with a fade-in,
        // so unless you intentionally shift the starting position, they are all black...!
        item.currentTime = 0.5;
      });
    }
  }
}

const initialize = () => {
  for (const el of Array.from(document.querySelectorAll<HTMLDivElement>('.slider'))) {
    new Slider(el);
  }
};

(() => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
    return;
  }

  initialize();
})();
