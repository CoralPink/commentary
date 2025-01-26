const WORKER_PATH = '/commentary/hl-worker.js';
const MAX_THREAD = 8;

const POP_WAIT = 20;
const TIME_OUT = 600;

// Singleton Class
class WorkerPool {
  private static instance: WorkerPool | undefined;
  private workerRefs: WeakRef<Worker>[] = [];

  constructor(threadNum = 0) {
    if (WorkerPool.instance) {
      /* biome-ignore lint: no-constructor-return */
      return WorkerPool.instance;
    }

    for (let i = 0; i < Math.min(threadNum, MAX_THREAD); i++) {
      this.workerRefs.push(new WeakRef(new Worker(WORKER_PATH)));
    }

    WorkerPool.instance = this;
  }

  release(): void {
    for (const workerRef of this.workerRefs) {
      const worker = workerRef.deref();
      if (worker) {
        worker.terminate();
      }
    }
    this.workerRefs.length = 0;
    WorkerPool.instance = undefined;
  }

  push(worker: Worker): void {
    this.workerRefs.push(new WeakRef(worker));
  }

  async pop(): Promise<Worker> {
    let retry = true;

    const workerPromise = new Promise<Worker>(resolve => {
      const checkAndPop = () => {
        const workerRef = this.workerRefs.pop();
        const worker = workerRef?.deref();

        if (worker) {
          resolve(worker);
          return;
        }

        if (retry) {
          setTimeout(checkAndPop, POP_WAIT);
        }
      };

      checkAndPop();
    });

    const timeOutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        retry = false;
        reject(new Error('Pool pop time out!'));
      }, TIME_OUT);
    });

    return Promise.race([workerPromise, timeOutPromise]);
  }
}

const createClipButton = (): HTMLButtonElement => {
  const elem = document.createElement('button');
  elem.setAttribute('class', 'copy-button');
  elem.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.setAttribute('class', 'icon-copy fa-icon');

  elem.appendChild(icon);
  return elem;
};

const copyCode = (target: EventTarget | null): void => {
  if (!(target instanceof HTMLElement)) return;

  const showTooltip = (msg: string): void => {
    const tip = document.createElement('div');
    tip.setAttribute('class', 'tooltiptext');
    tip.insertAdjacentText('afterbegin', msg);

    const elem = target.closest('button');
    if (!elem) return;

    elem.appendChild(tip);
    setTimeout(() => elem.removeChild(tip), 1200);
  };

  const pre = target.closest('pre');
  const code = pre?.querySelector('code');

  if (code) {
    navigator.clipboard.writeText(code.innerText).then(
      () => showTooltip('Copied!'),
      () => showTooltip('Failed...'),
    );
  }
};

export const procCodeBlock = (): void => {
  const article = document.getElementById('article');

  if (!article) {
    return;
  }

  const codeQuery = Array.from(article.querySelectorAll('pre code')).filter(
    (code): code is HTMLElement => !code.classList.contains('language-txt'),
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
        worker.onmessage = (ev: MessageEvent) => {
          const { highlightCode, needNerdFonts } = ev.data;
          code.innerHTML = highlightCode;

          if (needNerdFonts) {
            code.style.fontFamily = `${window.getComputedStyle(code).fontFamily}, 'Symbols Nerd Font Mono'`;
          }
          code.setAttribute('translate', 'no');

          workerPool.push(worker);
        };

        worker.onerror = (err: ErrorEvent) => {
          console.error('Error in codeBlock:', err);
          workerPool.push(worker);
        };

        worker.postMessage([code.textContent, code.classList[0]]);
      },
      err => {
        console.error('Error in workerPool:', err);
      },
    );

    const parent = code.parentNode;

    if (parent) {
      const cb = document.importNode(clipButton, true);
      cb.addEventListener('click', ev => copyCode(ev.target), { once: false, passive: true });

      parent.insertBefore(cb, parent.firstChild);
    }
  }

  const releaseTime = (threadNum > MAX_THREAD ? threadNum / MAX_THREAD + 1 : 1) * TIME_OUT;
  setTimeout(() => workerPool.release(), releaseTime);
};
