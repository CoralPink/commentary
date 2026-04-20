type PulseCallback = (deadline: IdleDeadline) => void;
type Pulse = (cb: PulseCallback) => number;

type IdleTask = {
  handle: number;
  callback: IdleRequestCallback;
};

type IdleQueue = IdleTask[];

const FRAME_BUDGET = 8;

const jobQueue: (() => void)[] = [];

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
  const idleQueue: IdleQueue = [];

  let scheduled = false;

  channel.port1.onmessage = () => {
    const start = performance.now();
    const deadline = {
      didTimeout: false,
      timeRemaining: () => Math.max(0, FRAME_BUDGET - (performance.now() - start)),
    };

    let index = 0;

    while (index < idleQueue.length && deadline.timeRemaining() > 0) {
      const task = idleQueue[index++]!;

      try {
        task.callback(deadline);
      } catch (err: unknown) {
        console.error('idleCallback: task threw an error', err);
      }
    }

    idleQueue.splice(0, index);

    if (idleQueue.length > 0) {
      requestAnimationFrame(() => {
        channel.port2.postMessage(0);
      });
    } else {
      scheduled = false;
    }
  };

  return (callback: IdleRequestCallback): number => {
    const handle = ++id;
    idleQueue.push({ handle, callback });

    if (!scheduled) {
      scheduled = true;

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

/**
 * Executes the very first pulse on the next animation frame.
 *
 * The purpose of this rAF is to establish a clear lifecycle boundary:
 * - separate the previous cycle from the next one
 * - ensure all scheduled work starts strictly *after* the current frame is rendered
 *
 * After this first invocation:
 * - the pulse mechanism is immediately switched to `idlePulse`
 * - subsequent jobs run via `requestIdleCallback` (or its emulation)
 *
 * Even if the initial jobs are extremely lightweight (e.g. disposal / cleanup),
 * running the first pulse inside rAF provides:
 * - phase separation from layout / paint work
 * - a stable anchor point for Safari's idle callback emulation
 * - a deterministic "start of cycle" marker for dispose / init jobs
 *
 * In other words, this function prepares the pulse scheduler
 * for the next lifecycle rather than merely scheduling work.
 */
const firstFramePulse: Pulse = cb => {
  requestAnimationFrame(() => {
    pulse = idlePulse;

    cb({
      didTimeout: false,
      timeRemaining: () => Infinity,
    });
  });

  return 0;
};

let pulse: Pulse = firstFramePulse;

const runLoop = (deadline: IdleDeadline): void => {
  let index = 0;

  while (index < jobQueue.length && deadline.timeRemaining() > 0) {
    const job = jobQueue[index++]!;

    try {
      job();
    } catch (err) {
      // Keep the scheduler alive even if one job misbehaves.
      console.error('pulse: job threw an error', err);
    }
  }

  jobQueue.splice(0, index);

  if (jobQueue.length === 0) {
    loopScheduled = false;
    return;
  }
  pulse(runLoop);
};

export const scheduleJob = (job: () => void): void => {
  jobQueue.push(job);

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
 * Prepares the pulse scheduler for the next lifecycle.
 * Must be called BEFORE scheduling any dispose / init jobs.
 */
export const prepareForNextCycle = (): void => {
  pulse = firstFramePulse;

  jobQueue.length = 0;
  loopScheduled = false;
};
