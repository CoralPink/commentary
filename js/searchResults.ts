import { updateMark } from './mark.ts';
import { getSearchBar } from './searchHelper.ts';

import { setHTML } from './utils/html-sanitizer.ts';

const SCORE_BAR_MIN = 1;
const SCORE_BAR_MAX = 512;
const SCORE_BAR_LOW = 80;
const SCORE_BAR_HIGH = 192;
const SCORE_BAR_OPTIMUM = 240;

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

export class SearchResults extends HTMLElement {
  private currentFocus: HTMLElement | null = null;
  private controller: AbortController | null = null;

  connectedCallback(): void {
    if (this.controller !== null) {
      return;
    }

    this.controller = new AbortController();

    this.addEventListener('keydown', this.handleKeydown, {
      passive: false,
      signal: this.controller.signal,
    });

    this.addEventListener('click', this.handleClick, {
      passive: true,
      signal: this.controller.signal,
    });
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;

    this.currentFocus = null;
  }

  public update(html: string): void {
    const container = document.createElement('div');
    setHTML(container, html);

    const fragment = document.createDocumentFragment();

    for (const result of Array.from(container.children)) {
      if (!(result instanceof HTMLElement)) {
        continue;
      }

      const page = result.dataset['page'];
      const label = result.dataset['label'];
      const score = result.dataset['score'];

      if (page === undefined || label === undefined || score === undefined) {
        console.warn('SearchResults#update: invalid data');
        continue;
      }

      result.className = 'result';
      result.tabIndex = 0;
      result.role = 'option';
      result.ariaLabel = `${page} ${score}pt`;

      const excerpt = document.createElement('span');
      excerpt.className = 'excerpt';
      setHTML(excerpt, result.innerHTML);

      const pageElement = document.createElement('span');
      pageElement.className = 'label';
      pageElement.textContent = label;

      result.replaceChildren(pageElement, excerpt, createScoreElement(score));
      fragment.append(result);
    }
    this.replaceChildren(fragment);
  }

  private open(result: HTMLElement): void {
    const href = result.dataset['href'];

    if (href === undefined) {
      return;
    }

    const url = new URL(href, document.baseURI);

    if (checkURL(url)) {
      updateMark();
    }

    navigation.navigate(url);
  }

  private updateFocus(result: HTMLElement): boolean {
    if (this.currentFocus === result) {
      return false;
    }

    if (this.currentFocus !== null) {
      this.currentFocus.ariaSelected = null;
    }

    result.ariaSelected = 'true';
    this.currentFocus = result;

    getSearchBar().ariaActiveDescendantElement = result;

    return true;
  }

  public focusFirstResult(): void {
    const result = this.querySelector('.result');

    if (!(result instanceof HTMLElement)) {
      return;
    }

    result.focus();
    this.updateFocus(result);
  }

  private moveFocus(result: Element | null): void {
    if (!(result instanceof HTMLElement)) {
      return;
    }

    if (!result.matches('[role="option"]')) {
      return;
    }

    result.focus();
    this.updateFocus(result);
  }

  private handleKeydown = (ev: KeyboardEvent): void => {
    const result = ev.target;

    if (!(result instanceof HTMLElement)) {
      return;
    }

    if (!result.matches('[role="option"]')) {
      return;
    }

    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.moveFocus(result.nextElementSibling);
        break;

      case 'ArrowUp': {
        ev.preventDefault();

        const previous = result.previousElementSibling;

        if (previous !== null) {
          this.moveFocus(previous);
        } else {
          getSearchBar().focus();
        }
        break;
      }

      case 'Enter':
        this.open(result);
        break;
    }
  };

  private handleClick = (ev: MouseEvent): void => {
    const target = ev.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const result = target.closest('[role="option"]');

    if (!(result instanceof HTMLElement) || !this.contains(result)) {
      return;
    }

    if (this.updateFocus(result)) {
      return;
    }

    this.open(result);
  };

  public focusAndSelect(): void {
    const first = this.querySelector('[role="option"]');

    if (!(first instanceof HTMLElement)) {
      return;
    }

    first.focus();
    this.updateFocus(first);
  }

  public clear(): void {
    this.replaceChildren();
  }
}
