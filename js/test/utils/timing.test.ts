import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, throttle } from '@/utils/timing.ts';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs once after the delay, using the latest arguments', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced('first');
    vi.advanceTimersByTime(50);

    debounced('latest');
    vi.advanceTimersByTime(99);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('latest');
  });

  it('resets the delay after each call', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced();
    vi.advanceTimersByTime(80);
    debounced();
    vi.advanceTimersByTime(80);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(20);

    expect(callback).toHaveBeenCalledOnce();
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs immediately, then ignores calls until the interval has elapsed', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('first');
    expect(callback).toHaveBeenCalledExactlyOnceWith('first');

    vi.advanceTimersByTime(99);
    throttled('too soon');

    expect(callback).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(1);
    throttled('after interval');

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('after interval');
  });

  it('does not run a trailing call for calls made during the interval', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('first');
    vi.advanceTimersByTime(50);
    throttled('ignored');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('first');
  });
});
