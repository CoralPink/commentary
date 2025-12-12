type PulseCallback = (deadline: IdleDeadline) => void;
type Pulse = (cb: PulseCallback) => number;

const LAYOUT_TIME = 1.0;

const queue: (() => void)[] = [];
let loopScheduled = false;

/**
 * Safari does not support `requestIdleCallback`!
 * We'll have to emulate similar behavior instead.
 *
 * refs: https://developer.mozilla.org/ja/docs/Web/API/Window/requestIdleCallback
 */
const emulateIdleCallback: (cb: IdleRequestCallback) => number = (() => {
  let id = 0;

  const channel = new MessageChannel();
  const queue = new Map<number, IdleRequestCallback>();

  let rafScheduled = false;

  channel.port1.onmessage = () => {
    const now = performance.now();
    const start = now + LAYOUT_TIME;

    queue.forEach((cb, handle) => {
      const deadline: IdleDeadline = {
        didTimeout: false,
        timeRemaining: () => Math.max(0, 5 - (performance.now() - start)),
      };

      cb(deadline);
      queue.delete(handle);
    });

    rafScheduled = false;
  };

  return (callback: IdleRequestCallback): number => {
    const handle = ++id;
    queue.set(handle, callback);

    if (!rafScheduled) {
      rafScheduled = true;

      requestAnimationFrame(() => {
        channel.port2.postMessage(0);
      });
    }

    return handle;
  };
})();

const idlePulse: Pulse =
  typeof globalThis.requestIdleCallback === 'function'
    ? globalThis.requestIdleCallback.bind(globalThis)
    : cb => emulateIdleCallback(cb);

const firstFramePulse: Pulse = cb => {
  // Use requestAnimationFrame only for the first frame
  requestAnimationFrame(() => {
    // After executing once, immediately replace it with idlePulse.
    pulse = idlePulse;

    cb({
      didTimeout: false,
      timeRemaining: () => Infinity,
    } as IdleDeadline);
  });

  return 0;
};

let pulse: Pulse = firstFramePulse;

const runLoop = (deadline: IdleDeadline): void => {
  let time = deadline.timeRemaining();

  while (time > 0 && queue.length > 0) {
    const job = queue.shift()!;

    try {
      job();
    } catch (err) {
      // Keep the scheduler alive even if one job misbehaves.
      console.error('pulse: job threw an error', err);
    }
    time = deadline.timeRemaining();
  }

  if (queue.length === 0) {
    loopScheduled = false;
    return;
  }
  pulse(runLoop);
};

export const scheduleJob = (job: () => void): void => {
  queue.push(job);

  if (loopScheduled) {
    return;
  }
  loopScheduled = true;
  pulse(runLoop);
};

export const processChunked = <T>(items: ReadonlyArray<T>, each: (x: T) => void): void => {
  let i = 0;
  const snapshot = items.length;

  const tick = (deadline: IdleDeadline) => {
    while (deadline.timeRemaining() > 0 && i < snapshot) {
      try {
        each(items[i++]!);
      } catch (err) {
        console.error('pulse: processChunked callback threw an error', err);
      }
    }

    if (i < snapshot) {
      pulse(tick);
    }
  };

  pulse(tick);
};

/**
 * Resets the pulse mechanism to its initial state.
 *
 * MUST only be called at page navigation or initialization boundaries,
 * never during active job processing.
 */
export const initPulse = (): void => {
  pulse = firstFramePulse;

  queue.length = 0;
  loopScheduled = false;
};
