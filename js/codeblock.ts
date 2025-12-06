import { initWorker } from './webworker/hl-initialize.ts';
import { isErrorPayload, type Payload, type SendToWorker } from './webworker/hl-types.ts';

const TOOLTIP_FADEOUT_MS = 1200;

let sendToWorker: SendToWorker;
let clipButton: HTMLButtonElement;

const showTooltip = (target: HTMLElement, msg: string): void => {
  const tip = document.createElement('div');
  tip.classList.add('tooltiptext');
  tip.insertAdjacentText('afterbegin', msg);

  const button = target.closest('button');

  if (button === null) {
    return;
  }
  button.appendChild(tip);

  setTimeout(() => button.removeChild(tip), TOOLTIP_FADEOUT_MS);
};

const copyCode = (target: EventTarget | null): void => {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const code = target.closest('pre')?.querySelector('code');

  if (!code) {
    return;
  }

  navigator.clipboard.writeText(code.innerText).then(
    () => showTooltip(target, 'Copied!'),
    () => showTooltip(target, 'Failed...'),
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
    code.innerHTML = res.highlightCode;

    if (res.needNerdFonts) {
      code.style.fontFamily = `${globalThis.getComputedStyle(code).fontFamily}, 'Symbols Nerd Font Mono'`;
    }

    const cb = document.importNode(clipButton, true);
    cb.addEventListener('click', ev => copyCode(ev.target), {
      once: false,
      passive: true,
    });

    parent.insertBefore(cb, parent.firstChild);
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

export const registryCodeBlock = (html: HTMLElement): (() => void) => {
  const codeBlocks = Array.from(html.querySelectorAll('pre code:not(.language-txt)'));

  if (codeBlocks.length === 0) {
    return () => {}; // no-op dispose
  }

  const obs = new IntersectionObserver(setupHighlight, { threshold: 0 });

  for (const x of codeBlocks) {
    obs.observe(x);
  }

  return () => {
    obs.disconnect();
  };
};

const createClipButton = (): void => {
  clipButton = document.createElement('button');

  clipButton.classList.add('copy-button');
  clipButton.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.classList.add('icon-copy', 'fa-icon');

  clipButton.appendChild(icon);
};

export const initCodeBlock = (): void => {
  sendToWorker = initWorker();

  createClipButton();
};
