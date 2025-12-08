const POTISION_GAP = 10;

const calcTop = (target: HTMLElement, pop: HTMLElement): number => {
  const rect = target.getBoundingClientRect();
  const popHeight = pop.offsetHeight;

  const top = rect.bottom + POTISION_GAP;

  // Flip above if overflowing viewport bottom
  if (top + popHeight > globalThis.innerHeight - POTISION_GAP) {
    return rect.top - popHeight - POTISION_GAP;
  }
  return top;
};

const closeFootnotePop = (target: HTMLElement, elm: HTMLElement): void => {
  elm.classList.remove('show');

  target.removeAttribute('aria-expanded');
  target.removeAttribute('aria-controls');

  const handleTransitionEnd = (ev: TransitionEvent) => {
    if (ev.propertyName === 'opacity') {
      elm.removeEventListener('transitionend', handleTransitionEnd);
      elm.remove();
    }
  };

  elm.addEventListener('transitionend', handleTransitionEnd);
};

const insertFootnote = (pop: HTMLElement, footnote: HTMLElement): void => {
  pop.insertAdjacentHTML('afterbegin', footnote.innerHTML);
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

const handleFootnoteClick = (target: EventTarget | null): void => {
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

  if (!footnote) {
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

  insertFootnote(pop, footnote);

  requestAnimationFrame(() => {
    pop.classList.add('show');
  });

  document.body.appendChild(pop);

  const onClickOutside = (ev: MouseEvent): void => {
    if (!(ev.target instanceof Node)) {
      return;
    }
    if (pop.contains(ev.target) || target === ev.target) {
      return;
    }

    closeFootnotePop(target, pop);
    document.removeEventListener('click', onClickOutside);
  };

  document.addEventListener('click', onClickOutside, {
    once: false,
    passive: true,
  });
};

export const initFootnote = (html: HTMLElement): void => {
  for (const x of Array.from(html.querySelectorAll('sup.ft-reference'))) {
    x.addEventListener('click', ev => handleFootnoteClick(ev.target), {
      once: false,
      passive: true,
    });
  }
};
