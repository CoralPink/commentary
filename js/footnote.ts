const closePopover = (tip: HTMLElement) => {
  tip.classList.remove('show');

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.propertyName === 'opacity') {
      tip.removeEventListener('transitionend', handleTransitionEnd);
      tip.remove();
    }
  };

  tip.addEventListener('transitionend', handleTransitionEnd);
};

const handleFootnoteClick = (target: EventTarget | null): void => {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const href = target.getAttribute('data-href');

  if (!href) {
    return;
  }

  const footnote = document.getElementById(href.slice(1));

  if (!footnote) {
    return;
  }

  const tip = document.createElement('aside');
  tip.setAttribute('class', 'ft-pop');
  tip.insertAdjacentHTML('afterbegin', footnote.innerHTML);

  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('id', `popover-${href.slice(1)}`);

  target.setAttribute('aria-expanded', 'true');
  target.setAttribute('aria-controls', `popover-${href.slice(1)}`);

  document.body.appendChild(tip);

  const rect = (target as HTMLElement).getBoundingClientRect();
  const popHeight = tip.offsetHeight;
  const gap = 10;
  let top = rect.bottom + gap;

  // Flip above if overflowing viewport bottom
  if (top + popHeight > window.innerHeight - gap) {
    top = rect.top - popHeight - gap;
  }
  tip.style.position = 'absolute';
  tip.style.top = `${top + window.scrollY}px`;

  requestAnimationFrame(() => {
    tip.classList.add('show');
  });

  // Connect the button to the popover for accessibility
  const onClickOutside = (ev: MouseEvent) => {
    if (!(ev.target instanceof Node)) {
      return;
    }

    if (!tip.contains(ev.target) && target !== ev.target) {
      closePopover(tip);

      target.setAttribute('aria-expanded', 'false');
      target.removeAttribute('aria-controls');

      document.removeEventListener('click', onClickOutside);
    }
  };

  document.addEventListener('click', onClickOutside, { once: false, passive: true });
};

export const initFootnote = (): void => {
  for (const sup of Array.from(document.querySelectorAll('sup.ft-reference'))) {
    sup.addEventListener('click', ev => handleFootnoteClick(ev.target), { once: false, passive: true });
  }
};
