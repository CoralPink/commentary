import { updateMark } from './mark.ts';
import { focusSearchBar, getSearchPopElement, hiddenSearch } from './searcher.ts';

import { setHTML } from './utils/html-sanitizer.ts';

const SCORE_BAR_MIN = 1;
const SCORE_BAR_MAX = 512;
const SCORE_BAR_LOW = 80;
const SCORE_BAR_HIGH = 192;
const SCORE_BAR_OPTIMUM = 240;

let currentFocus: SearchResult | null = null;

const createScoreElement = (score: string): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = 'score';

  const meter = document.createElement('meter');
  meter.min = SCORE_BAR_MIN;
  meter.max = SCORE_BAR_MAX;
  meter.low = SCORE_BAR_LOW;
  meter.high = SCORE_BAR_HIGH;
  meter.optimum = SCORE_BAR_OPTIMUM;

  meter.value = Math.min(Number(score), SCORE_BAR_MAX);

  const text = document.createElement('span');
  text.textContent = `${score}pt`;

  container.append(meter, text);

  return container;
};

const checkURL = (url: URL): boolean =>
  url.origin + url.pathname === globalThis.location.origin + globalThis.location.pathname;

export class SearchResult extends HTMLElement {
  connectedCallback(): void {
    this.tabIndex = 0;
    this.role = 'option';

    this.render();

    this.addEventListener('keydown', this.handleKeydown, {
      passive: false,
    });

    this.addEventListener('click', this.handleClick, {
      passive: true,
    });
  }

  private render(): void {
    const page = this.dataset['page'];
    const label = this.dataset['label'];
    const score = this.dataset['score'];

    if (page === undefined || score === undefined || label === undefined) {
      console.warn('SearchResult#render: invalid data');
      return;
    }

    const excerpt = document.createElement('span');
    excerpt.className = 'excerpt';
    setHTML(excerpt, this.innerHTML);

    const pageElement = document.createElement('span');
    pageElement.className = 'label';
    pageElement.textContent = label;

    this.replaceChildren(pageElement, excerpt, createScoreElement(score));
    this.ariaLabel = `${page} ${score}pt`;
  }

  private open(): void {
    const href = this.dataset['href'];

    if (href === undefined) {
      return;
    }

    const url = new URL(href, document.baseURI);

    if (checkURL(url)) {
      updateMark();
    }

    navigation.navigate(url);

    requestAnimationFrame(() => {
      hiddenSearch();
    });
  }

  private updateFocus(): boolean {
    if (currentFocus === this) {
      return false;
    }

    if (currentFocus !== null) {
      currentFocus.ariaSelected = null;
    }
    this.ariaSelected = 'true';

    const pop = getSearchPopElement();

    if (pop !== null) {
      pop.ariaActiveDescendantElement = this;
    }

    currentFocus = this;
    return true;
  }

  private moveFocus(elm: Element | null): void {
    if (!(elm instanceof SearchResult)) {
      return;
    }

    elm.focus();
    elm.updateFocus();
  }

  private handleKeydown(ev: KeyboardEvent): void {
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.moveFocus(this.nextElementSibling);
        break;

      case 'ArrowUp': {
        ev.preventDefault();

        const previous = this.previousElementSibling;

        if (previous !== null) {
          this.moveFocus(previous);
        } else {
          focusSearchBar();
        }

        break;
      }

      case 'Enter':
        this.open();
        break;
    }
  }

  private handleClick(): void {
    if (this.updateFocus()) {
      return;
    }

    this.open();
  }

  public focusAndSelect(): void {
    this.focus();
    this.updateFocus();
  }
}
