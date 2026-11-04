import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRAME_BUDGET } from '@/utils/frame.ts';

const jobCost = FRAME_BUDGET * 0.6;

const mocks = vi.hoisted(() => ({
  idleCallbacks: new Map<number, (deadline: IdleDeadline) => void>(),
  nextIdleId: 0,
  cancelIdle: vi.fn(),
}));

vi.mock('@/utils/emulate/idle-callback.ts', () => ({
  default: {
    request(callback: (deadline: IdleDeadline) => void): number {
      const id = ++mocks.nextIdleId;
      mocks.idleCallbacks.set(id, callback);
      return id;
    },

    cancel(id: number): void {
      mocks.idleCallbacks.delete(id);
      mocks.cancelIdle(id);
    },
  },
}));

type Scheduler = typeof import('@/utils/pulse.ts');

let scheduler: Scheduler;
let frameCallbacks: Map<number, FrameRequestCallback>;
let nextFrameId: number;
let now: number;

const runNextFrame = (): void => {
  const entry = frameCallbacks.entries().next().value as [number, FrameRequestCallback] | undefined;

  if (!entry) {
    throw new Error('No animation frame is scheduled');
  }

  const [id, callback] = entry;
  frameCallbacks.delete(id);
  callback(now);
};

const runNextIdleCallback = (): void => {
  const entry = mocks.idleCallbacks.entries().next().value as [number, (deadline: IdleDeadline) => void] | undefined;

  if (!entry) {
    throw new Error('No idle callback is scheduled');
  }

  const [id, callback] = entry;
  mocks.idleCallbacks.delete(id);

  callback({
    didTimeout: false,
    timeRemaining: () => 8,
  });
};

describe('pulse scheduler', () => {
  beforeEach(async () => {
    vi.resetModules();

    frameCallbacks = new Map();
    nextFrameId = 0;
    now = 0;

    mocks.idleCallbacks.clear();
    mocks.nextIdleId = 0;
    mocks.cancelIdle.mockClear();

    vi.stubGlobal('requestIdleCallback', undefined);
    vi.stubGlobal('cancelIdleCallback', undefined);

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      frameCallbacks.set(id, callback);
      return id;
    });

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frameCallbacks.delete(id);
    });

    vi.spyOn(performance, 'now').mockImplementation(() => now);

    scheduler = await import('@/utils/pulse.ts');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('runs the first pulse on the next animation frame', () => {
    const job = vi.fn();

    scheduler.scheduleJob(job);

    expect(job).not.toHaveBeenCalled();
    expect(frameCallbacks.size).toBe(1);

    runNextFrame();

    expect(job).toHaveBeenCalledOnce();
  });

  it('continues remaining jobs in a later idle pulse when the budget is used', () => {
    const results: number[] = [];

    scheduler.scheduleJob(() => {
      results.push(1);
      now += jobCost;
    });

    scheduler.scheduleJob(() => {
      results.push(2);
      now += jobCost;
    });

    scheduler.scheduleJob(() => {
      results.push(3);
    });

    runNextFrame();

    expect(results).toEqual([1, 2]);
    expect(mocks.idleCallbacks.size).toBe(1);

    runNextIdleCallback();

    expect(results).toEqual([1, 2, 3]);
  });

  it('continues running jobs after one job throws', () => {
    const error = new Error('job failed');
    const nextJob = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    scheduler.scheduleJob(() => {
      throw error;
    });
    scheduler.scheduleJob(nextJob);

    runNextFrame();

    expect(consoleError).toHaveBeenCalledWith('pulse: job threw an error', error);
    expect(nextJob).toHaveBeenCalledOnce();
  });

  it('cancels pending work and advances the lifecycle cycle', () => {
    const job = vi.fn();

    scheduler.scheduleJob(job);

    const cycle = scheduler.prepareForNextCycle();

    expect(cycle).toBe(1);
    expect(scheduler.isCurrentCycle(cycle)).toBe(true);
    expect(scheduler.isCurrentCycle(cycle - 1)).toBe(false);
    expect(frameCallbacks.size).toBe(0);

    expect(() => runNextFrame()).toThrow('No animation frame is scheduled');
    expect(job).not.toHaveBeenCalled();
  });

  it('preserves jobs scheduled in a new cycle from a running job', () => {
    const results: string[] = [];

    scheduler.scheduleJob(() => {
      results.push('current');

      scheduler.prepareForNextCycle();

      scheduler.scheduleJob(() => {
        results.push('new cycle');
      });
    });

    scheduler.scheduleJob(() => {
      results.push('old cycle');
    });

    runNextFrame();

    // The old cycle loop stops, and the new job waits for the next frame
    expect(results).toEqual(['current']);

    runNextFrame();

    expect(results).toEqual(['current', 'new cycle']);
  });
});
