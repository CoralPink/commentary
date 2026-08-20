import type { Disposer } from './types.ts';

const TOOLTIP_FADEOUT_MS = 1200;

let isBootstrap = false;

const showResult = (button: HTMLButtonElement, msg: string): void => {
  const result = button.querySelector('.copy-result');

  if (!(result instanceof HTMLElement)) {
    return;
  }

  result.textContent = msg;
  button.classList.add('show-result');

  setTimeout(() => {
    button.classList.remove('show-result');
  }, TOOLTIP_FADEOUT_MS);
};

const copyCode = (ev: CommandEvent): void => {
  if (ev.command !== '--copy') {
    return;
  }

  if (!(ev.currentTarget instanceof HTMLDivElement)) {
    return;
  }

  const code = ev.currentTarget.querySelector('code');

  if (code === null) {
    return;
  }

  const button = ev.source;

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  navigator.clipboard.writeText(code.innerText).then(
    () => showResult(button, 'Copied!'),
    () => showResult(button, 'Failed...'),
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

  for (const x of html.querySelectorAll<HTMLDivElement>('.code-block')) {
    x.addEventListener(
      'command',
      ev => {
        copyCode(ev as CommandEvent);
      },
      {
        passive: true,
        signal: ac.signal,
      },
    );
  }

  return () => {
    ac.abort();
  };
};
