import { ROOT_PATH } from '../constants.ts';
import type { Disposer } from './types.ts';

import { loadStyleSheet } from '../utils/css-loader.ts';
import { setHTML } from '../utils/html-sanitizer.ts';

const FILE_STYLE_FOOTNOTE = 'css/footnote-legacy.css';

const POSITION_GAP = 10;

const calcTop = (target: HTMLElement, pop: HTMLElement): number => {
  const rect = target.getBoundingClientRect();
  const popHeight = pop.offsetHeight;

  const top = rect.bottom + POSITION_GAP;

  // Flip above if overflowing viewport bottom
  if (top + popHeight > globalThis.innerHeight - POSITION_GAP) {
    return rect.top - popHeight - POSITION_GAP;
  }
  return top;
};

const closeFootnotePop = (target: HTMLElement, elm: HTMLElement): void => {
  target.ariaExpanded = null;
  target.ariaControlsElements = null;

  elm.addEventListener(
    'transitionend',
    (ev: TransitionEvent) => {
      if (ev.propertyName === 'opacity') {
        elm.remove();
      }
    },
    { once: true, passive: true },
  );

  elm.classList.remove('show');
};

const insertFootnote = (pop: HTMLElement): void => {
  const sup = pop.querySelector<HTMLAnchorElement>('p > sup a[href^="#to-ft-"]');

  if (!sup) {
    return;
  }

  const oldHref = sup.getAttribute('href');

  if (!oldHref) {
    return;
  }

  sup.href = oldHref.replace(/^#to-ft-/, '#ft-');
};

const handleFootnoteClick = (ev: Event): void => {
  const target = ev.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const href = target.getAttribute('data-href');

  if (!href) {
    return;
  }

  const ftId = href.slice(1);
  const popIdStr = `popover-${ftId}`;

  // If this pop is already open, do nothing
  if (document.getElementById(popIdStr)) {
    return;
  }

  target.ariaExpanded = 'true';

  const popover = document.getElementById(popIdStr);

  if (popover !== null) {
    target.ariaControlsElements = [popover];
  }

  const pop = document.createElement('aside');

  pop.classList.add('ft-pop');
  pop.style.top = `${calcTop(target, pop) + globalThis.scrollY}px`;
  pop.role = 'tooltip';
  pop.id = popIdStr;

  const footnote = document.getElementById(ftId);

  if (footnote === null) {
    console.error(`footnote for ${ftId} does not exist.`);
    return;
  }

  setHTML(pop, footnote.innerHTML);
  insertFootnote(pop);

  requestAnimationFrame(() => {
    pop.classList.add('show');
  });

  document.body.append(pop);

  const ac = new AbortController();

  document.addEventListener(
    'click',
    (ev: PointerEvent) => {
      if (!(ev.target instanceof Node)) {
        return;
      }
      if (pop.contains(ev.target) || target === ev.target) {
        return;
      }

      closeFootnotePop(target, pop);
      ac.abort();
    },
    {
      passive: true,
      signal: ac.signal,
    },
  );
};

const loadStyle = async (): Promise<void> => await loadStyleSheet(`${ROOT_PATH}${FILE_STYLE_FOOTNOTE}`);

export const initialize = (html: HTMLElement): Disposer => {
  try {
    loadStyle();
  } catch (err: unknown) {
    console.error('Failed to load Footnote Style...');
    throw err;
  }

  const ac = new AbortController();

  for (const x of Array.from(html.querySelectorAll('sup.ft-reference'))) {
    x.addEventListener('click', handleFootnoteClick, {
      passive: true,
      signal: ac.signal,
    });
  }

  return () => {
    ac.abort();
  };
};
