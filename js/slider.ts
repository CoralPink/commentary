const CLASS_ARROW = 'arrow';
const ID_INDICATORS = 'indicators';

const ID_PREV = 'prev';
const ID_NEXT = 'next';

type Direction = typeof ID_PREV | typeof ID_NEXT;
type CompatibleMedia = HTMLVideoElement | HTMLImageElement;

class Slider {
  private medias: CompatibleMedia[];
  private indicators = document.createElement('div');

  private index = 0;

  private handleIntersect(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.goTo(this.medias.indexOf(entry.target as CompatibleMedia), false);
        return;
      }
    }
  }

  private observer = new IntersectionObserver(
    this.handleIntersect.bind(this),
    { threshold: 0.8 }
  );

  constructor(slider: HTMLDivElement) {
    this.medias = Array.from(slider.querySelector<HTMLDivElement>('.media')!.querySelectorAll('video, img'));

    this.createIndicators();

    const controls = document.createElement('div');
    controls.className = 'controls';

    controls.appendChild(this.createArrow(ID_PREV));
    controls.appendChild(this.indicators);
    controls.appendChild(this.createArrow(ID_NEXT));

    slider.appendChild(controls);
    this.addVideoEvent();

    for (const x of Array.from(this.medias)) {
      this.observer.observe(x);
    }
  }

  private goTo(next: number, scrollInto: boolean = true): void {
    const currentItem = this.medias[this.index];

    if (!currentItem) {
      return;
    }

    // Stop video before moving on
    if (currentItem instanceof HTMLVideoElement) {
      currentItem.pause();
    }

    const len = this.medias.length;
    this.index = (next % len + len) % len; // Index values are looped.

    if (scrollInto) {
      this.medias[this.index]!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    for (const [idx, elm] of Array.from(this.indicators.querySelectorAll<HTMLSpanElement>('span')).entries()) {
      if (idx === next) {
        elm.setAttribute('class', 'active');
      }
      else {
        elm.removeAttribute('class');
      }
    }
  }

  private createIndicators(): void {
    this.indicators = document.createElement('div');
    this.indicators.setAttribute('id', ID_INDICATORS);

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.medias.length; i++) {
      const elm = document.createElement('span');

      if (i === 0) {
        elm.classList.add('active');
      }
      elm.addEventListener('click', () => {
        this.goTo(i);
      }, { once: false, passive: true });

      fragment.appendChild(elm);
    }

    this.indicators.appendChild(fragment);
  }

  private createArrow = (dir: Direction): HTMLElement => {
    const arrow = document.createElement('div');

    arrow.setAttribute('class', CLASS_ARROW);
    arrow.id = dir;
    arrow.textContent = dir === ID_PREV ? '◀' : '▶';

    arrow.addEventListener('click', () => {
      this.goTo(this.index + (dir === ID_PREV ? -1 : 1))
    }, { once: false, passive: true });

    return arrow;
  }

  private addVideoEvent = (): void => {
    for (const item of this.medias) {
      if (item instanceof HTMLVideoElement) {
        item.addEventListener('ended', () => {
          this.goTo(this.index + 1);

          // Most of the videos on this site start with a fade-in,
          // so unless you intentionally shift the starting position, they are all black...!
          item.currentTime = 0.5;
        });
      }
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
