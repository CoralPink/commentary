import { FRAME_BUDGET } from './frame.ts';

import emulateIdleCallback from './emulate/idle-callback.ts';

type Job = (remainingBudget: number) => void;

type PendingTask = { kind: 'frame'; id: number } | { kind: 'idle'; id: number };

type PulseCallback = (deadline: IdleDeadline) => void;
type Pulse = (callback: PulseCallback) => number;

/** Jobs waiting to be executed by the scheduler. */
const jobQueue: Job[] = [];

/**
 * Identifies the current lifecycle generation.
 *
 * Incrementing this value lets asynchronous work determine whether it still
 * belongs to the active lifecycle.
 */
let cycle = 0;

/**
 * Indicates that the next scheduler pulse should begin on an animation frame.
 *
 * After that first pulse, queued work is scheduled through the idle callback
 * mechanism or its fallback.
 */
let firstPulse = true;

/** The currently scheduled animation-frame or idle callback, if any. */
let pendingTask: PendingTask | undefined;

/** Prevents multiple scheduler loops from running at the same time. */
let running = false;

/** Retrieves the current lifecycle generation. */
export const getCurrentCycle = (): number => cycle;

/** Whether the browser provides the native idle callback API. */
const supportsRequestIdleCallback = typeof globalThis.requestIdleCallback === 'function';

/**
 * Schedules a callback using the native idle callback API when available,
 * otherwise using the emulated implementation.
 */
const requestIdle: Pulse = supportsRequestIdleCallback
  ? globalThis.requestIdleCallback.bind(globalThis)
  : callback => emulateIdleCallback.request(callback);

/**
 * Cancels an idle callback scheduled by {@link requestIdle}.
 *
 * @param id - Handle returned by {@link requestIdle}.
 */
const cancelIdle = (id: number): void => {
  supportsRequestIdleCallback ? globalThis.cancelIdleCallback(id) : emulateIdleCallback.cancel(id);
};

/** Cancels the scheduler's currently pending frame or idle callback. */
const cancelPendingTask = (): void => {
  if (pendingTask === undefined) {
    return;
  }

  if (pendingTask.kind === 'frame') {
    cancelAnimationFrame(pendingTask.id);
  } else {
    cancelIdle(pendingTask.id);
  }

  pendingTask = undefined;
};

/**
 * Schedules the next scheduler pulse if jobs are waiting and no pulse is
 * already pending or running.
 *
 * The first pulse of each lifecycle starts on the next animation frame.
 * Subsequent pulses use the native idle callback API or its fallback.
 */
const schedulePump = (): void => {
  if (pendingTask !== undefined || running || jobQueue.length === 0) {
    return;
  }

  if (!firstPulse) {
    pendingTask = { kind: 'idle', id: requestIdle(runLoop) };
    return;
  }

  const id = requestAnimationFrame(() => {
    pendingTask = undefined;
    firstPulse = false;
    runLoop();
  });

  pendingTask = { kind: 'frame', id };
};

/**
 * Runs queued jobs while the current pulse has time remaining.
 *
 * The time budget is checked between jobs. A job runs to completion and cannot
 * be preempted, so individual jobs should remain short.
 *
 * @param deadline - Native or emulated idle deadline. Omitted for the first
 *   animation-frame pulse, which uses the scheduler's own time budget.
 */
const runLoop = (deadline?: IdleDeadline): void => {
  if (running) {
    return;
  }

  pendingTask = undefined;
  running = true;

  const runCycle = cycle;
  const start = performance.now();

  let index = 0;

  try {
    while (cycle === runCycle && index < jobQueue.length) {
      const elapsed = performance.now() - start;
      const remaining = deadline ? Math.min(deadline.timeRemaining(), FRAME_BUDGET - elapsed) : FRAME_BUDGET - elapsed;

      if (remaining <= 0) {
        break;
      }

      const job = jobQueue[index++]!;

      try {
        job(remaining);
      } catch (error: unknown) {
        console.error('pulse: job threw an error', error);
      }
    }

    // The queue after `prepareForNextCycle()` belongs to the new cycle, so do not modify it
    if (cycle === runCycle) {
      jobQueue.splice(0, index);
    }
  } finally {
    running = false;
  }

  schedulePump();
};

/**
 * Adds a job to the scheduler queue.
 *
 * Jobs execute in queue order and are processed across multiple pulses when
 * necessary.
 *
 * @param job - Synchronous work item to schedule.
 */
export const scheduleJob = (job: Job): void => {
  jobQueue.push(job);
  schedulePump();
};

/**
 * Starts a new lifecycle generation and discards jobs from the previous one.
 *
 * Any pending frame or idle callback is canceled. Call this before scheduling
 * disposal or initialization jobs for the new lifecycle.
 *
 * @returns The generation number for the new lifecycle.
 */
export const prepareForNextCycle = (): number => {
  cycle += 1;
  cancelPendingTask();

  jobQueue.length = 0;
  firstPulse = true;

  return cycle;
};

/**
 * Checks whether an asynchronous operation still belongs to the active
 * lifecycle generation.
 *
 * @param expectedCycle - Generation captured when the operation started.
 * @returns `true` if the operation belongs to the current lifecycle.
 */
export const isCurrentCycle = (expectedCycle: number): boolean => expectedCycle === cycle;

/**
 * Processes an array in scheduler-sized chunks.
 *
 * Each item is processed synchronously. If the time budget expires, processing
 * continues in a later scheduler pulse. A single slow `each` call cannot be
 * interrupted.
 *
 * @param items - Items to process.
 * @param each - Function invoked once for each item.
 */
export const processChunked = <T>(items: ReadonlyArray<T>, each: (item: T) => void): void => {
  const snapshot = items.length;
  const startCycle = cycle;

  let index = 0;

  const tick: Job = remainingBudget => {
    const start = performance.now();

    while (isCurrentCycle(startCycle) && index < snapshot && performance.now() - start < remainingBudget) {
      try {
        each(items[index++]!);
      } catch (error: unknown) {
        console.error('pulse: processChunked callback threw an error', error);
      }
    }

    if (isCurrentCycle(startCycle) && index < snapshot) {
      scheduleJob(tick);
    }
  };

  scheduleJob(tick);
};
