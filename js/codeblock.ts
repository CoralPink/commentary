const WORKER_PATH = '/commentary/hl-worker.js';

const TOOLTIP_FADEOUT_MS = 1200;

const createClipButton = (): HTMLButtonElement => {
  const elem = document.createElement('button');
  elem.setAttribute('class', 'copy-button');
  elem.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.setAttribute('class', 'icon-copy fa-icon');

  elem.appendChild(icon);
  return elem;
};

const showTooltip = (target: HTMLElement, msg: string): void => {
  const tip = document.createElement('div');
  tip.setAttribute('class', 'tooltiptext');
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

  const pre = target.closest('pre');
  const code = pre?.querySelector('code');

  if (code) {
    navigator.clipboard.writeText(code.innerText).then(
      () => showTooltip(target, 'Copied!'),
      () => showTooltip(target, 'Failed...'),
    );
  }
};

const observer = new IntersectionObserver(
  entries => {
    const clipButton = createClipButton();

    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }
      const code = entry.target as HTMLElement;
      observer.unobserve(code);

      const worker = new Worker(WORKER_PATH);

      worker.onmessage = (ev: MessageEvent) => {
        const { highlightCode, needNerdFonts } = ev.data;
        code.innerHTML = highlightCode;

        if (needNerdFonts) {
          code.style.fontFamily = `${window.getComputedStyle(code).fontFamily}, 'Symbols Nerd Font Mono'`;
        }
        code.setAttribute('translate', 'no');

        worker.terminate();
      };

      worker.onerror = (err: ErrorEvent) => {
        console.error('Error in codeBlock:', err);
        worker.terminate();
      };

      worker.postMessage([code.textContent, code.classList[0]]);

      const parent = code.parentNode;

      if (parent === null) {
        continue;
      }
      const cb = document.importNode(clipButton, true);
      cb.addEventListener('click', ev => copyCode(ev.target), { once: false, passive: true });

      parent.insertBefore(cb, parent.firstChild);
    }
  },
  { threshold: 0 },
);

export const initCodeBlock = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    return;
  }

  for (const x of Array.from(article.querySelectorAll('pre code')).filter(
    (y): y is HTMLElement => !y.classList.contains('language-txt'),
  )) {
    observer.observe(x);
  }
};
