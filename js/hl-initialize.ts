/**
 * @fileoverview This module initializes a SharedWorker or a fallback Worker,
 * depending on the platform support.
 *
 * It handles worker communication for syntax highlighting tasks.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
 */
import type { WorkerResponse, SendToWorker, Payload } from './hl-types';

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
  const callbacks = new Map<number, WorkerCallback>();
  let sharedId = 0;

  const sharedWorker = new SharedWorker(SHAREDWORKER_PATH);
  sharedWorker.port.start();

  sharedWorker.port.onmessage = (ev: MessageEvent<WorkerResponse>) => {
    const { id, payload } = ev.data;

    callbacks.get(id)?.(payload);
    callbacks.delete(id);
  };

  sharedWorker.onerror = (err: ErrorEvent) => {
    console.error('SharedWorker error:', err);
  };

  return (text, lang, callback) => {
    const id = sharedId++;

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
