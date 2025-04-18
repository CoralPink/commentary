declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v7.0.2';

const CACHE_HOST = 'https://coralpink.github.io/';
const CACHE_URL = '/commentary/';

const CACHE_LIST: string[] = [
  'book.js',
  'hl-worker.js',
  'wasm_book_bg.wasm',

  'css/general.css',
  'css/style.css',

  'woff2/OpenSans-BoldItalic.woff2',
  'woff2/OpenSans-Italic.woff2',
  'woff2/FiraCode-VF.woff2',

  'apple-touch-icon.png',
  'chrome-96x96.png',
  'favicon.ico',
  'favicon.svg',

  'manifest.json',
] as const;

const FALLBACK_URL = `${CACHE_URL}chrome-96x96.png`;

const deleteCache = async (key: string): Promise<void> => {
  await caches.delete(key);
};

const deleteOldCaches = async (): Promise<void> => {
  const cacheKeepList = [CACHE_VERSION];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })(),
  );
  event.waitUntil(deleteOldCaches());
});

const extractVersionParts = (cacheName: string): { major: number; minor: number } => {
  const versionString = cacheName.substring(1);
  const [major, minor] = versionString.split('.').map(Number);
  return { major, minor };
};

const shouldSkipWaiting = async (cacheList: string[]): Promise<boolean> => {
  const target = extractVersionParts(CACHE_VERSION);

  return cacheList.some(cacheName => {
    const current = extractVersionParts(cacheName);
    return current.major < target.major || (current.major === target.major && current.minor < target.minor);
  });
};

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const shouldSkip = await shouldSkipWaiting(await caches.keys());
      if (shouldSkip) {
        self.skipWaiting();
      }
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(CACHE_LIST.map(x => CACHE_URL + x));
    })(),
  );
});

const putInCache = async (request: Request, response: Response): Promise<void> => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response);
};

const cacheFirst = async (
  request: Request,
  preloadResponse: Promise<Response | undefined> | undefined,
): Promise<Response> => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);

  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  const preloadResponseResult = await preloadResponse;

  if (preloadResponseResult && preloadResponseResult instanceof Response) {
    putInCache(request, preloadResponseResult.clone());
    return preloadResponseResult;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);

    // No cache processing for partial content
    if (responseFromNetwork.status !== 206) {
      putInCache(request, responseFromNetwork.clone());
    }

    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(FALLBACK_URL);

    if (fallbackResponse) {
      return fallbackResponse;
    }

    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response(`Network error happened: ${String(error)}`, {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

self.addEventListener(
  'fetch',
  (event: FetchEvent): void => {
    const request = event.request;

    if (!request.url.startsWith(CACHE_HOST)) {
      return;
    }

    if (request.destination === 'document') {
      return;
    }

    event.respondWith(cacheFirst(request, event.preloadResponse));
  },
  { once: false, passive: true },
);
