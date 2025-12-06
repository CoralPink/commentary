type PulseCallback = (deadline: IdleDeadline) => void;
type Pulse = (cb: PulseCallback) => number;

const createPulse: Pulse =
  typeof globalThis.requestIdleCallback === 'function'
    ? globalThis.requestIdleCallback.bind(globalThis)
    : cb => {
        setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => 1,
          } as IdleDeadline);
        }, 0);
        return 0;
      };

const pulse: Pulse = createPulse;

const queue: (() => void)[] = [];
let loopScheduled = false;

const runLoop = (deadline: IdleDeadline): void => {
  while (deadline.timeRemaining() > 0 && queue.length > 0) {
    const job = queue.shift()!;
    job();
  }

  if (queue.length > 0) {
    pulse(runLoop);
  } else {
    loopScheduled = false;
  }
};

export const scheduleJob = (job: () => void): void => {
  queue.push(job);

  if (loopScheduled) {
    return;
  }
  loopScheduled = true;
  pulse(runLoop);
};

export const processChunked = <T>(items: T[], each: (x: T) => void): void => {
  let i = 0;

  const tick = (deadline: IdleDeadline) => {
    while (deadline.timeRemaining() > 0 && i < items.length) {
      each(items[i++]!);
    }

    if (i < items.length) {
      pulse(tick);
    }
  };

  pulse(tick);
};
