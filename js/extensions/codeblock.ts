import type { Disposer } from './types.ts';

import { setHTML } from '../utils/html-sanitizer.ts';
import { initWorker } from '../webworker/hl-initialize.ts';
import { isErrorPayload, type Payload, type SendToWorker } from '../webworker/hl-types.ts';

const TOOLTIP_FADEOUT_MS = 1200;

let sendToWorker: SendToWorker;
let clipButton: HTMLButtonElement;

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

    button.appendChild(tip);

    setTimeout(() => {
      button.removeChild(tip);
    }, TOOLTIP_FADEOUT_MS);
  };

  navigator.clipboard.writeText(code.innerText).then(
    () => showTooltip('Copied!'),
    () => showTooltip('Failed...'),
  );
};

const highlight = (code: HTMLElement): void => {
  const parent = code.parentNode;

  if (parent === null || code.textContent === null) {
    return;
  }

  const lang = code.classList[0];

  if (lang === undefined) {
    return;
  }

  sendToWorker(code.textContent, lang, (res: Payload): void => {
    if (isErrorPayload(res)) {
      return;
    }
    code.setAttribute('translate', 'no');
    setHTML(code, res.highlightCode);

    if (res.needNerdFonts) {
      code.style.fontFamily = `${globalThis.getComputedStyle(code).fontFamily}, 'Symbols Nerd Font Mono'`;
    }

    parent.insertBefore(document.importNode(clipButton, true), parent.firstChild);
  });
};

const setupHighlight = (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
  for (const x of entries) {
    if (!x.isIntersecting) {
      continue;
    }

    highlight(x.target as HTMLElement);
    obs.unobserve(x.target);
  }
};

const createClipButton = (): void => {
  clipButton = document.createElement('button');

  clipButton.classList.add('copy-button');
  clipButton.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.classList.add('icon-copy', 'fa-icon');

  clipButton.appendChild(icon);
};

const bootstrap = (): void => {
  if (isBootstrap) {
    return;
  }
  sendToWorker = initWorker();
  createClipButton();

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, {
      once: false,
      passive: true,
    });
  }

  isBootstrap = true;
};

export const initialize = (html: HTMLElement): Disposer => {
  bootstrap();

  const codeBlocks = Array.from(html.querySelectorAll('pre code:not(.language-txt)'));

  if (codeBlocks.length === 0) {
    return () => {}; // no-op dispose
  }

  const obs = new IntersectionObserver(setupHighlight, { threshold: 0 });

  for (const x of codeBlocks) {
    obs.observe(x);
  }

  html.addEventListener('click', copyCode, { once: false, passive: false });

  return () => {
    obs.disconnect();
    html.removeEventListener('click', copyCode);
  };
};
