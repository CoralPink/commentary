import type { Disposer } from './types.ts';

const TOOLTIP_FADEOUT_MS = 1200;

let isBootstrap = false;

const copyCode = (ev: PointerEvent): void => {
  if (!(ev.target instanceof HTMLElement)) {
    return;
  }

  const button = ev.target.closest('button.copy-button');

  if (!button) {
    return;
  }

  const code = button.closest('pre')?.querySelector('code');

  if (!code) {
    return;
  }

  const showTooltip = (msg: string): void => {
    const tip = document.createElement('div');

    tip.classList.add('tooltiptext');
    tip.insertAdjacentText('afterbegin', msg);

    button.append(tip);

    setTimeout(() => {
      tip.remove();
    }, TOOLTIP_FADEOUT_MS);
  };

  navigator.clipboard.writeText(code.innerText).then(
    () => showTooltip('Copied!'),
    () => showTooltip('Failed...'),
  );
};

const bootstrap = (): void => {
  if (isBootstrap) {
    return;
  }

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, {
      passive: true,
    });
  }

  isBootstrap = true;
};

export const initialize = (html: HTMLElement): Disposer => {
  bootstrap();

  const ac = new AbortController();

  html.addEventListener('click', copyCode, {
    passive: false,
    signal: ac.signal,
  });

  return () => {
    ac.abort();
  };
};
