const MAX_THREAD = 8;

const workerPool = [];

const popWorkerPool = async () => {
  if (workerPool.length < MAX_THREAD) {
    const worker = new Worker('/commentary/hl-worker.js');
    workerPool.push(worker);
  }

  while (true) {
    const worker = workerPool.pop();

    if (worker !== undefined) {
      return worker;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

const releaseWorker = () => {
  for (const worker of workerPool) {
    worker.terminate();
  }
  workerPool.length = 0;
};

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

export const codeBlock = async () => {
  const main = document.getElementById('main');

  if (main === null) {
    return;
  }

  const codeQuery = main.querySelectorAll('pre code');

  if (codeQuery.length <= 0) {
    return;
  }

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }

  const clip = document.createElement('button');

  clip.className = 'fa-copy clip-button';
  clip.setAttribute('aria-label', 'Copy to clipboard');
  clip.innerHTML = '<i class="tooltiptext"></i>';

  for (const code of codeQuery) {
    if (code.classList.contains('language-txt')) {
      continue;
    }

    const worker = await popWorkerPool();

    worker.onmessage = ev => {
      code.innerHTML = ev.data;
      workerPool.push(worker);
    };

    worker.onerror = e => {
      console.error(`Error codeBlock(): ${e}`);
      workerPool.push(worker);
    };

    worker.postMessage([code.textContent, code.classList[0]]);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.insertBefore(document.importNode(clip, true), buttons.firstChild);
    buttons.addEventListener('mousedown', codeCopy);

    const parent = code.parentNode;
    parent.insertBefore(buttons, parent.firstChild);
  }

  releaseWorker();
};
