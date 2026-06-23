import type { Disposer } from './types.ts';

import { setHTML } from '../utils/html-sanitizer.ts';

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
  target.removeAttribute('aria-expanded');
  target.removeAttribute('aria-controls');

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
  const sup = pop.querySelector('p > sup a[href^="#to-ft-"]');

  if (!sup) {
    return;
  }

  const oldHref = sup.getAttribute('href');

  if (!oldHref) {
    return;
  }

  sup.setAttribute('href', oldHref.replace(/^#to-ft-/, '#ft-'));
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

  const footnote = document.getElementById(ftId);

  if (footnote === null) {
    console.error(`footnote for ${ftId} does not exist.`);
    return;
  }

  target.setAttribute('aria-expanded', 'true');
  target.setAttribute('aria-controls', popIdStr);

  const pop = document.createElement('aside');

  pop.classList.add('ft-pop');
  pop.style.top = `${calcTop(target, pop) + globalThis.scrollY}px`;
  pop.setAttribute('role', 'tooltip');
  pop.setAttribute('id', popIdStr);

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
