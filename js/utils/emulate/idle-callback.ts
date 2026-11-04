import { FRAME_BUDGET } from '../frame.ts'

type IdleTask = {
  handle: number;
  callback: IdleRequestCallback;
};

type IdleQueue = IdleTask[];

/**
 * Provides a cooperative approximation of `requestIdleCallback` for browsers
 * that do not implement it, including Safari.
 *
 * The fallback starts after an animation frame and processes queued callbacks
 * for up to {@link FRAME_BUDGET} milliseconds per message. It is not a true
 * browser idle-period signal; it only provides a bounded time budget.
 */
export default (() => {
  let id = 0;
  let scheduled = false;

  const idleQueue: IdleQueue = [];
  const channel = new MessageChannel();

  channel.port1.onmessage = () => {
    const start = performance.now();
    const deadline: IdleDeadline = {
      didTimeout: false,
      timeRemaining: () => Math.max(0, FRAME_BUDGET - (performance.now() - start)),
    };

    let index = 0;

    while (index < idleQueue.length && deadline.timeRemaining() > 0) {
      const task = idleQueue[index++]!;

      try {
        task.callback(deadline);
      } catch (error: unknown) {
        console.error('idleCallback: task threw an error', error);
      }
    }

    idleQueue.splice(0, index);

    if (idleQueue.length > 0) {
      requestAnimationFrame(() => channel.port2.postMessage(0));
    } else {
      scheduled = false;
    }
  };

  return {
    /**
     * Adds a callback to the emulated idle queue.
     *
     * @param callback - Callback to invoke with the emulated deadline.
     * @returns A handle that can be passed to {@link cancel}.
     */
    request(callback: IdleRequestCallback): number {
      const handle = ++id;
      idleQueue.push({ handle, callback });

      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => channel.port2.postMessage(0));
      }

      return handle;
    },

    /**
     * Removes a callback from the emulated idle queue if it has not run yet.
     *
     * @param handle - Handle returned by {@link request}.
     */
    cancel(handle: number): void {
      const index = idleQueue.findIndex(task => task.handle === handle);

      if (index !== -1) {
        idleQueue.splice(index, 1);
      }
    },
  };
})();
