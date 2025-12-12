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
 * TODO:
 * Currently, Brotli can only be used with Safari 18.4 or later.
 *
 * It is possible that other browsers may support Brotli in the future,
 * in which case it should be rewritten to be more versatile!!
 */
const isUseBrotli = (): boolean => {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  if (!isSafari) {
    return false;
  }

  const match = ua.match(/Version\/(\d+)\.(\d+)/);

  if (!match) {
    return false;
  }

  const [major = 0, minor = 0] = match.slice(1, 3).map(Number);

  return major > 18 || (major === 18 && minor >= 4);
};

export const fetchAndDecompress = async (url: string) => {
  const isBrotli = isUseBrotli();
  const response = await fetchRequest(`${url}${isBrotli ? '.br' : '.gz'}`);

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const format: CompressionFormat = isBrotli ? 'brotli' : 'gzip';

  // @ts-ignore: `brotli` is valid in Safari
  const stream = response.body.pipeThrough(new DecompressionStream(format));
  const decompressed = await new Response(stream).arrayBuffer();

  return JSON.parse(new TextDecoder().decode(decompressed));
};
