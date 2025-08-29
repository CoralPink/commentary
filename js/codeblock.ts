import { initWorker } from './hl-initialize.ts';
import { isErrorPayload, type Payload, type SendToWorker } from './hl-types.ts';

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
      code.style.fontFamily = `${window.getComputedStyle(code).fontFamily}, 'Symbols Nerd Font Mono'`;
    }

    const cb = document.importNode(clipButton, true);
    cb.addEventListener('click', ev => copyCode(ev.target), { once: false, passive: true });

    parent.insertBefore(cb, parent.firstChild);
  });
};

const observer = new IntersectionObserver(
  entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const code = entry.target as HTMLElement;
      highlight(code);

      observer.unobserve(code);
    }
  },
  { threshold: 0 },
);

const createClipButton = (): HTMLButtonElement => {
  const elm = document.createElement('button');

  elm.classList.add('copy-button');
  elm.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.classList.add('icon-copy', 'fa-icon');

  elm.appendChild(icon);

  return elm;
};

export const initCodeBlock = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    return;
  }

  const codeBlocks = Array.from(article.querySelectorAll('pre code:not(.language-txt)'));

  if (codeBlocks.length === 0) {
    return;
  }

  clipButton = createClipButton();
  sendToWorker = initWorker();

  for (const x of codeBlocks) {
    observer.observe(x);
  }
};
