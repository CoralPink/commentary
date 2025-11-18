const FETCH_TIMEOUT = 10000;

export const fetchRequest = async (url: string): Promise<Response> => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
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
