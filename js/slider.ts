const CLASS_ARROW = 'arrow';
const ID_INDICATORS = 'indicators';

const ID_PREV = 'left';
const ID_NEXT = 'right'

type Direction = typeof ID_PREV | typeof ID_NEXT;
type CompatibleMedia = HTMLVideoElement | HTMLImageElement;

export default class Slider {
  private slider: HTMLDivElement;
  private media: HTMLDivElement;
  private items: CompatibleMedia[];

  private indicators = document.createElement('div');

  private observer = new IntersectionObserver(
    this.handleIntersect.bind(this),
    { threshold: 0.8 }
  );

  private index = 0;

  private handleIntersect(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.goTo(this.items.indexOf(entry.target as CompatibleMedia), false);
        return;
      }
    }
  }

  constructor(sliderId: string) {
    this.slider = document.getElementById(sliderId) as HTMLDivElement;

    this.media = this.slider.querySelector<HTMLDivElement>('.media')!;
    this.items = Array.from(this.media.querySelectorAll('video, img'));

    if (!this.slider || !this.media) {
      console.warn('Slider not found:', sliderId);
      return;
    }

    this.items.forEach(elm => this.observer.observe(elm));

    this.initIndicators();
    this.createControls();
    this.addVideoEvent();
  }

  private goTo(next: number, scrollInto: boolean = true): void {
    const currentItem = this.items[this.index];

    if (!currentItem) {
      return;
    }

    // Stop video before moving on
    if (currentItem instanceof HTMLVideoElement) {
      currentItem.pause();
    }

    const len = this.items.length;
    this.index = (next % len + len) % len; // Index values are looped.

    if (scrollInto) {
      this.items[this.index]!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
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

  private initIndicators(): void {
    this.indicators = document.createElement('div');
    this.indicators.setAttribute('id', ID_INDICATORS);

    for (let i = 0; i < this.items.length; i++) {
      const elm = document.createElement('span');

      if (i === 0) {
        elm.classList.add('active');
      }
      elm.addEventListener('click', () => {
        this.goTo(i)
      }, { once: false, passive: true });

      this.indicators.appendChild(elm);
    }
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

  private createControls(): void {
    const controls = document.createElement('div');
    controls.className = 'controls';

    controls.appendChild(this.createArrow(ID_PREV));
    controls.appendChild(this.indicators);
    controls.appendChild(this.createArrow(ID_NEXT));

    this.slider.appendChild(controls);
  }

  private addVideoEvent = (): void => {
    for (const item of this.items) {
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
