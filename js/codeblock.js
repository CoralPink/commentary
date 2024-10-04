const WORKER_PATH = '/commentary/hl-worker.js';
const MAX_THREAD = 8;

const POP_WAIT = 20;
const TIME_OUT = 600;

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
      /* biome-ignore lint: no-constructor-return */
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
  const elem = document.createElement('button');
  elem.setAttribute('class', 'icon-button');
  elem.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = elem.appendChild(document.createElement('div'));
  icon.setAttribute('class', 'icon-copy fa-icon');

  return elem;
};

const copyCode = target => {
  const showTooltip = msg => {
    const tip = document.createElement('div');
    tip.setAttribute('class', 'tooltiptext');
    tip.insertAdjacentText('afterbegin', msg);

    const elem = target.closest('button');
    elem.appendChild(tip);

    setTimeout(() => elem.removeChild(tip), 1200);
  };

  navigator.clipboard.writeText(target.closest('pre').querySelector('code').innerText).then(
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
    workerPool.pop().then(
      worker => {
        worker.onmessage = ev => {
          const { highlightCode, needNerdFonts } = ev.data;
          code.innerHTML = highlightCode;

          if (needNerdFonts) {
            code.style.fontFamily = `${window.getComputedStyle(code).fontFamily}, 'Symbols Nerd Font Mono'`;
          }
          workerPool.push(worker);
        };

        worker.onerror = err => {
          console.error('Error codeBlock:', err);
          workerPool.push(worker);
        };

        worker.postMessage([code.textContent, code.classList[0]]);
      },
      err => {
        console.error('Error workerPool:', err);
      },
    );

    const parent = code.parentNode;

    const cb = document.importNode(clipButton, true);
    cb.addEventListener('mouseup', ev => copyCode(ev.target), { once: false, passive: true });

    parent.insertBefore(cb, parent.firstChild);
  }

  const releaseTime = (threadNum > MAX_THREAD ? threadNum / MAX_THREAD + 1 : 1) * TIME_OUT;
  setTimeout(() => workerPool.release(), releaseTime);
};
