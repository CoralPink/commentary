// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('emulateIdleCallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('runs later callbacks when the current callback cancels itself', async () => {
    const frames: FrameRequestCallback[] = [];

    class FakeMessageChannel {
      port1: {
        onmessage: ((event: MessageEvent) => void) | null;
      } = {
          onmessage: null,
        };

      port2 = {
        postMessage: () => {
          this.port1.onmessage?.(new MessageEvent('message'));
        },
      };
    }

    vi.stubGlobal('MessageChannel', FakeMessageChannel);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });

    vi.resetModules();

    const { default: idleCallback } = await import('../utils/emulate/idle-callback.ts');
    const results: string[] = [];

    let firstHandle = 0;

    firstHandle = idleCallback.request(() => {
      results.push('first');
      idleCallback.cancel(firstHandle);
      idleCallback.cancel(thirdHandle);
    });

    idleCallback.request(() => {
      results.push('second');
    });

    const thirdHandle = idleCallback.request(() => {
      results.push('third');
    });

    expect(frames).toHaveLength(1);

    // Emulate the scheduled animation frame and the resulting message.
    frames.shift()?.(performance.now());

    expect(results).toEqual(['first', 'second']);
  });
});
