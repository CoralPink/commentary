const WORKER_PATH = '/commentary/hl-worker.js';
const MAX_THREAD = 16;

// Singleton Class
class WorkerPool {
  static _instance;

  #array;
  #count;

  constructor() {
    if (WorkerPool._instance) {
      return WorkerPool._instance;
    }
    this.#array = [];
    this.#count = 0;
    WorkerPool._instance = this;
  }

  push(worker) {
    if (worker !== undefined) {
      this.#array.push(worker);
      return;
    }
    this.#array.push(new Worker(WORKER_PATH));
    this.#count++;
  }

  async pop() {
    if (this.#count < MAX_THREAD) {
      this.push();
    }

    const start = performance.now();

    do {
      const worker = this.#array.pop();

      if (worker !== undefined) {
        return worker;
      }

      await new Promise(resolve => setTimeout(resolve, 10));
    } while (performance.now() - start < 1000);

    throw new Error('Pool pop time out!');
  }

  release() {
    for (const worker of this.#array) {
      worker.terminate();
    }
    this.#array.length = 0;
    this.#count = 0;
  }
}

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

  const workerPool = new WorkerPool();

  for (const code of codeQuery) {
    if (code.classList.contains('language-txt')) {
      continue;
    }

    try {
      const worker = await workerPool.pop();

      worker.onmessage = ev => {
        code.innerHTML = ev.data;
        workerPool.push(worker);
      };

      worker.onerror = e => {
        console.error(`Error codeBlock(): ${e}`);
        workerPool.push(worker);
      };

      worker.postMessage([code.textContent, code.classList[0]]);
    } catch (e) {
      console.error(e);
    }

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.insertBefore(document.importNode(clip, true), buttons.firstChild);
    buttons.addEventListener('mousedown', codeCopy);

    const parent = code.parentNode;
    parent.insertBefore(buttons, parent.firstChild);
  }
};
