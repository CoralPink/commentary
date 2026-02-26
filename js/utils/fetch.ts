import type { AbortableOptions } from './type.ts';

const FETCH_TIMEOUT = 9000;

type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw' | 'brotli';

export const fetchWithTimeout = async (url: string, options: AbortableOptions = {}): Promise<Response> => {
  const controller = new AbortController();
  const onAbort = () => controller.abort();

  const parentSignal = options.signal;

  if (parentSignal) {
    parentSignal.addEventListener('abort', onAbort, {
      once: true,
      passive: true,
    });
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);

    if (parentSignal) {
      parentSignal.removeEventListener('abort', onAbort);
    }
  }
};

export const fetchText = async (url: string, options: AbortableOptions = {}): Promise<string> => {
  const response = await fetchWithTimeout(url, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.text();
};

/*
 * Brotli is available in Safari 18.4 and Firefox 147 or later.
 *
 * refs: https://developer.mozilla.org/ja/docs/Web/API/DecompressionStream
 */
const isUseBrotli = (): boolean => {
  // While relying on try/catch is a bit “rough,”
  // it's currently the most reliable method for handling browser differences.
  try {
    new DecompressionStream('brotli');
    return true;
  } catch {
    return false;
  }
};

export const fetchAndDecompress = async (url: string, options: AbortableOptions = {}): Promise<ArrayBuffer> => {
  const isBrotli = isUseBrotli();
  const response = await fetchWithTimeout(`${url}${isBrotli ? '.br' : '.gz'}`, options);

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const format: CompressionFormat = isBrotli ? 'brotli' : 'gzip';

  const stream = response.body.pipeThrough(new DecompressionStream(format));
  return await new Response(stream).arrayBuffer();
};
