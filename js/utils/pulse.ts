type PulseCallback = (deadline: IdleDeadline) => void;
type Pulse = (cb: PulseCallback) => number;

const REMAINING_RS = 8;

const queue: (() => void)[] = [];
let loopScheduled = false;

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

const idlePulse: Pulse =
  typeof requestIdleCallback === 'function'
    ? cb => requestIdleCallback(cb)
    : cb => {
        setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => REMAINING_RS,
          } as IdleDeadline);
        });

        return 0;
      };

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

export const processChunked = <T>(items: T[], each: (x: T) => void): void => {
  let i = 0;

  const tick = (deadline: IdleDeadline) => {
    while (deadline.timeRemaining() > 0 && i < items.length) {
      try {
        each(items[i++]!);
      } catch (err) {
        console.error('pulse: processChunked callback threw an error', err);
      }
    }

    if (i < items.length) {
      pulse(tick);
    }
  };

  pulse(tick);
};

export const initPulse = (): void => {
  pulse = firstFramePulse;

  queue.length = 0;
  loopScheduled = false;
};
