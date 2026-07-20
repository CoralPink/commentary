import type { Disposer } from './types.ts';

import { setHTML } from '../utils/html-sanitizer.ts';

const getAnchorName = (id: string): string => `--footnote-anchor-${id}`;

const getFootnoteId = (button: HTMLButtonElement): string | null => {
  const href = button.dataset['href'];

  if (href === undefined) {
    return null;
  }

  return href.slice(1);
};

const insertFootnote = (pop: HTMLElement): void => {
  const link = pop.querySelector<HTMLAnchorElement>('a[href^="#to-ft-"]');

  if (link === null) {
    return;
  }

  link.hash = link.hash.replace(/^#to-ft-/, '#ft-');
};

const createPopoverElement = (id: string): HTMLElement => {
  const el = document.createElement('aside');

  el.popover = 'auto';
  el.className = 'ft-pop';
  el.role = 'dialog';
  el.style.positionAnchor = getAnchorName(id);

  const footnote = document.getElementById(id);

  if (footnote === null) {
    throw new Error(`footnote for ${id} does not exist.`);
  }

  setHTML(el, footnote.innerHTML);
  insertFootnote(el);

  return el;
};

const createPopover = (button: HTMLButtonElement): void => {
  const id = getFootnoteId(button);

  if (id === null) {
    throw new Error('missing footnote ID.');
  }

  const pop = createPopoverElement(id);

  button.ariaExpanded = 'true';
  button.style.anchorName = getAnchorName(id);
  button.ariaControlsElements = [pop];

  pop.addEventListener(
    'toggle',
    (ev: ToggleEvent) => {
      if (ev.newState !== 'closed') {
        return;
      }

      button.ariaExpanded = 'false';
      button.ariaControlsElements = null;

      pop.remove();
    },
    { passive: true },
  );

  document.body.append(pop);
  pop.showPopover();
};

const handleFootnoteClick = (ev: Event): void => {
  const button = ev.target;

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  createPopover(button);
};

export const initialize = (html: HTMLElement): Disposer => {
  const footnote = Array.from(html.querySelectorAll('sup.ft-reference'));
  const ac = new AbortController();

  for (const x of footnote) {
    x.addEventListener('click', handleFootnoteClick, {
      passive: true,
      signal: ac.signal,
    });
  }

  return () => {
    ac.abort();
  };
};
