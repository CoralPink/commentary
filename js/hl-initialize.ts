/**
 * @fileoverview This module initializes a SharedWorker or a fallback Worker,
 * depending on the platform support.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
 */
import { v7 as uuidv7 } from 'uuid';

import { type WorkerResponse, type SendToWorker, type Payload, isErrorPayload } from './hl-types';

const SHAREDWORKER_PATH = '/commentary/hl-sharedworker.js';
const WORKER_PATH = '/commentary/hl-worker.js';

type WorkerCallback = (data: Payload) => void;

/**
 * Initializes a SharedWorker-based communication system.
 *
 * If supported, a single SharedWorker is reused across multiple connections.
 * This helps reduce resource usage and enables inter-tab communication.
 */
const useSharedWorker = (): SendToWorker => {
  const callbacks = new Map<string, WorkerCallback>();

  const sharedWorker = new SharedWorker(SHAREDWORKER_PATH);

  sharedWorker.onerror = (err: ErrorEvent) => {
    console.error(err);

    // Notify pending callbacks of errors
    for (const callback of callbacks.values()) {
      callback({ error: 'Error in sharedworker' });
    }
    callbacks.clear();
  };

  sharedWorker.port.onmessage = (ev: MessageEvent<WorkerResponse>) => {
    const { id, payload } = ev.data;

    if (isErrorPayload(payload)) {
      console.error(payload.error);
    }

    const callback = callbacks.get(id);

    if (!callback) {
      console.error(`Unknown ID(${id}) was used`);
      return;
    }
    callback(payload);
    callbacks.delete(id);
  };

  sharedWorker.port.start();

  return (text, lang, callback) => {
    const id = uuidv7();

    callbacks.set(id, callback);
    sharedWorker.port.postMessage({ id, text, lang });
  };
};

/**
 * Initializes a simple dedicated Worker for each task.
 *
 * This is used as a fallback when SharedWorker is not available.
 * Suitable for environments where SharedWorker is unsupported, such as Chrome on Android.
 */
const useSimpleWorker = (): SendToWorker => (text, lang, callback) => {
  const worker = new Worker(WORKER_PATH);

  worker.onmessage = (ev: MessageEvent<Payload>) => {
    callback(ev.data);
    worker.terminate();
  };

  worker.onerror = (err: ErrorEvent) => {
    console.error('Error in fallback worker:', err);
    worker.terminate();
  };

  worker.postMessage([text, lang]);
};

export const initWorker = (): SendToWorker => ('SharedWorker' in globalThis ? useSharedWorker : useSimpleWorker)();
