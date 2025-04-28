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

  const onClickOutside = (ev: MouseEvent) => {
    if (!(ev.target instanceof Node)) {
      return;
    }

    if (!tip.contains(ev.target) && target !== ev.target) {
      closePopover(tip);
      document.removeEventListener('click', onClickOutside);
    }
  };

  target.appendChild(tip);

  requestAnimationFrame(() => {
    tip.classList.add('show');
  });

  document.addEventListener('click', onClickOutside, { once: false, passive: true });
};

export const initFootnote = (): void => {
  for (const sup of Array.from(document.querySelectorAll('sup.ft-reference'))) {
    sup.addEventListener('click', ev => handleFootnoteClick(ev.target), { once: false, passive: true });
  }
};
