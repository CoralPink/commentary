import { updateMark } from './mark.ts';
import { focusSearchBar, getSearchPopElement, hiddenSearch } from './searcher.ts';

import { setHTML } from './utils/html-sanitizer.ts';

let currentForcus: SearchResult | null = null;

// Fonts used in the score bar
const SCORE_BAR_CHARACTER = '▰';
// Rate used to calculate the length of the scorebar
const SCORE_BAR_RATE = 8;
// Maximum value displayed on the score bar (does not affect the actual score)
const SCORE_BAR_MAX = 256;

const createScoreElement = (score: number): HTMLDivElement => {
  const element = document.createElement('div');

  element.className = 'score';
  element.role = 'meter';
  element.ariaLabel = `score:${score}pt`;
  element.ariaValueNow = String(score);
  element.ariaValueMin = '0';
  element.ariaValueMax = String(SCORE_BAR_MAX);

  element.textContent = `${SCORE_BAR_CHARACTER.repeat(
    Math.floor(Math.min(score, SCORE_BAR_MAX) / SCORE_BAR_RATE),
  )} (${score}pt)`;

  return element;
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

    this.replaceChildren(pageElement, excerpt, createScoreElement(Number(score)));

    this.ariaLabel = `${page} ${score}pt`;
  }

  private open(): void {
    const href = this.dataset['href'];

    if (href === undefined) {
      return;
    }

    const url = new URL(href);

    if (checkURL(url)) {
      updateMark();
    }

    navigation.navigate(url);

    requestAnimationFrame(() => {
      hiddenSearch();
    });
  }

  private updateFocus(): boolean {
    if (currentForcus === this) {
      return false;
    }

    if (currentForcus !== null) {
      currentForcus.ariaSelected = null;
    }
    this.ariaSelected = 'true';

    const pop = getSearchPopElement();

    if (pop !== null) {
      pop.ariaActiveDescendantElement = this;
    }

    currentForcus = this;
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
      /*
      case "ArrowUp":
        ev.preventDefault();
        this.moveFocus(this.previousElementSibling);
        break;
      */
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
