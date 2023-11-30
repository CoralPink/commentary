const codeCopy = trigger => {
  const elem = trigger.target;

  const hideTooltip = () => {
    elem.firstChild.innerText = '';
    elem.className = 'fa-copy clip-button';
  };

  const showTooltip = msg => {
    elem.firstChild.innerText = msg;
    elem.className = 'fa-copy tooltipped';

    setTimeout(hideTooltip, 1200);
  };

  navigator.clipboard.writeText(elem.closest('pre').querySelector('code').innerText).then(
    () => showTooltip('Copied!'),
    () => showTooltip('Failed...'),
  );
};

export const codeBlock = () => {
  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }

  const clip = document.createElement('button');

  clip.className = 'fa-copy clip-button';
  clip.setAttribute('aria-label', 'Copy to clipboard');
  clip.innerHTML = '<i class="tooltiptext"></i>';

  for (const code of document.querySelector('.content main').querySelectorAll('pre code')) {
    if (code.classList.contains('language-txt')) {
      continue;
    }

    const worker = new Worker('/commentary/hl-worker.js');

    worker.onmessage = ev => {
      code.innerHTML = ev.data;
      worker.terminate();
    };

    worker.postMessage([code.textContent, code.classList[0]]);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.insertBefore(document.importNode(clip, true), buttons.firstChild);
    buttons.addEventListener('mousedown', codeCopy);

    const parent = code.parentNode;
    parent.insertBefore(buttons, parent.firstChild);
  }
};
