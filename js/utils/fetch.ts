const FETCH_TIMEOUT = 10000;

type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw' | 'brotli';

export const fetchRequest = async (url: string): Promise<Response> => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();

    // TODO: the alert() is intrusive.
    // Consider a less disruptive notification mechanism
    // (e.g., a toast or event dispatch to a notification handler)
    // in a future iteration if user feedback indicates this is jarring.
    alert('The request has timed out.');
  }, FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    return response;
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        console.error('Request timed out:', e.message);
      } else {
        console.error('Network error:', e.message);
      }
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchText = async (url: string): Promise<string> => {
  const response = await fetchRequest(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return await response.text();
};

/*
 * Brotli is available in Safari 18.4 and Firefox 147 or later.
 *
 * refs: https://developer.mozilla.org/ja/docs/Web/API/DecompressionStream
 */
export const fetchAndDecompress = async (url: string): Promise<ArrayBuffer> => {
  const isUseBrotli = (): boolean => {
    // While relying on try/catch is a bit “rough,”
    // it's currently the most reliable method for handling browser differences.
    try {
      // @ts-expect-error: Test whether Brotli can be used
      new DecompressionStream('brotli');
      return true;
    } catch {
      return false;
    }
  };

  const isBrotli = isUseBrotli();
  const response = await fetchRequest(`${url}${isBrotli ? '.br' : '.gz'}`);

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const format: CompressionFormat = isBrotli ? 'brotli' : 'gzip';

  // @ts-expect-error: Brotli is available in some browsers
  const stream = response.body.pipeThrough(new DecompressionStream(format));
  return await new Response(stream).arrayBuffer();
};
