const WORKER_PATH = '/commentary/hl-worker.js';
const MAX_THREAD = 16;

const POP_WAIT = 10;
const TIME_OUT = 1000;

// Singleton Class
class WorkerPool {
  static _instance;
  #array = [];

  constructor(threadNum = 0) {
    if (WorkerPool._instance) {
      return WorkerPool._instance;
    }

    for (let i = 0; i < Math.min(threadNum, MAX_THREAD); i++) {
      this.#array.push(new Worker(WORKER_PATH));
    }

    WorkerPool._instance = this;
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

  release() {
    for (const worker of this.#array) {
      worker.terminate();
    }
    this.#array.length = 0;
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

  const codeQuery = Array.from(main.querySelectorAll('pre code')).filter(
    code => !code.classList.contains('language-txt'),
  );

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

  const workerPool = new WorkerPool(codeQuery.length);

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

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.insertBefore(document.importNode(clip, true), buttons.firstChild);
    buttons.addEventListener('mousedown', codeCopy);

    const parent = code.parentNode;
    parent.insertBefore(buttons, parent.firstChild);
  }
};
