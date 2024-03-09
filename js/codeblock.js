const WORKER_PATH = '/commentary/hl-worker.js';
const MAX_THREAD = 16;

const POP_WAIT = 10;
const TIME_OUT = 300;

// Singleton Class
class WorkerPool {
  static #instance;
  #array = [];

  release() {
    for (const worker of this.#array) {
      worker.terminate();
    }
    this.#array.length = 0;
    WorkerPool.#instance = undefined;
  }

  constructor(threadNum = 0) {
    if (WorkerPool.#instance !== undefined) {
      return WorkerPool.#instance;
    }

    for (let i = 0; i < Math.min(threadNum, MAX_THREAD); i++) {
      this.#array.push(new Worker(WORKER_PATH));
    }
    WorkerPool.#instance = this;
  }

  push(thread) {
    this.#array.push(thread);
  }

  async pop() {
    let retry = true;

    const workerPromise = new Promise(resolve => {
      const checkAndPop = () => {
        const worker = this.#array.pop();

        if (worker !== undefined) {
          resolve(worker);
          return;
        }

        if (retry) {
          setTimeout(checkAndPop, POP_WAIT);
        }
      };

      checkAndPop();
    });

    const timeOutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        retry = false;
        reject(new Error('Pool pop time out!'));
      }, TIME_OUT);
    });

    return await Promise.race([workerPromise, timeOutPromise]);
  }
}

const createClipButton = () => {
  const clip = document.createElement('button');

  clip.className = 'fa-copy clip-button';
  clip.setAttribute('aria-label', 'Copy to clipboard');
  clip.innerHTML = '<div class="tooltiptext"></div>';

  const buttons = document.createElement('div');

  buttons.className = 'buttons';
  buttons.insertBefore(clip, buttons.firstChild);

  return buttons;
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

export const procCodeBlock = () => {
  const main = document.getElementById('main');

  if (main === null) {
    return;
  }

  const codeQuery = Array.from(main.querySelectorAll('pre code')).filter(
    code => !code.classList.contains('language-txt'),
  );

  const threadNum = codeQuery.length;

  if (threadNum <= 0) {
    return;
  }

  const clipButton = createClipButton();
  const workerPool = new WorkerPool(threadNum);

  for (const code of codeQuery) {
    workerPool
      .pop()
      .then(worker => {
        worker.onmessage = ev => {
          code.innerHTML = ev.data;
          workerPool.push(worker);
        };

        worker.onerror = e => {
          console.error(`Error codeBlock(): ${e}`);
          workerPool.push(worker);
        };

        worker.postMessage([code.textContent, code.classList[0]]);
      })
      .catch(e => {
        console.error(e);
      });

    const parent = code.parentNode;

    const cb = document.importNode(clipButton, true);
    cb.addEventListener('mousedown', codeCopy);

    parent.insertBefore(cb, parent.firstChild);
  }

  setTimeout(() => {
    workerPool.release();
  }, threadNum * TIME_OUT);

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }
};
