declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v7.2.3';

const CACHE_URL = '/commentary/';
const FALLBACK_IMAGE = 'chrome-96x96.png';

const installList = [
  'book.js',
  'hl-worker.js',
  'wasm_book_bg.wasm',

  'css/general.css',
  'css/style.css',

  'woff2/OpenSans-BoldItalic.woff2',
  'woff2/OpenSans-Italic.woff2',
  'woff2/FiraCode-VF.woff2',

  FALLBACK_IMAGE,
] as const satisfies readonly string[];

const skipDestination = new Set(['document', 'image', 'video', 'audio']);

const extractVersionParts = (cacheName: string): { major: number; minor: number } => {
  const versionString = cacheName.substring(1);
  const [major, minor] = versionString.split('.').map(Number);

  return { major, minor };
};

const shouldSkipWaiting = (cacheList: string[]): boolean => {
  const target = extractVersionParts(CACHE_VERSION);

  return cacheList.some(cacheName => {
    const current = extractVersionParts(cacheName);
    return current.major < target.major || (current.major === target.major && current.minor < target.minor);
  });
};

self.addEventListener('install', (event: ExtendableEvent): void => {
  event.waitUntil(
    (async () => {
      const shouldSkip = shouldSkipWaiting(await caches.keys());

      if (shouldSkip) {
        self.skipWaiting();
      }
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(installList.map(x => CACHE_URL + x));
    })(),
  );
});

const deleteCache = (key: string): Promise<boolean> => caches.delete(key);

const deleteOldCaches = async (): Promise<void> => {
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(key => ![CACHE_VERSION].includes(key));

  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('activate', (event: ExtendableEvent): void => {
  event.waitUntil(
    Promise.all([self.clients.claim(), self.registration.navigationPreload?.enable(), deleteOldCaches()]),
  );
});

const putInCache = (request: Request, response: Response): Promise<void> =>
  caches.open(CACHE_VERSION).then(cache => cache.put(request, response));

const usePreload = async (
  request: Request,
  preloadResponse: Promise<Response | undefined> | undefined,
  saveToCache = false,
): Promise<Response | undefined> => {
  const preload = await preloadResponse;

  if (preload && saveToCache) {
    putInCache(request, preload.clone());
  }

  return preload;
};

const cacheFirst = async (
  request: Request,
  preloadResponse: Promise<Response | undefined> | undefined,
): Promise<Response> => {
  // 1. use the preloaded response, if it's there
  const preload = await usePreload(request, preloadResponse, true);

  if (preload) {
    return preload;
  }

  // 2. get the resource from the cache
  const responseFromCache = await caches.match(request);

  if (responseFromCache) {
    return responseFromCache;
  }

  // 3. get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);

    // No cache processing for partial content
    if (responseFromNetwork.status !== 206) {
      putInCache(request, responseFromNetwork.clone());
    }

    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(`${CACHE_URL}${FALLBACK_IMAGE}`);

    if (fallbackResponse) {
      return fallbackResponse;
    }

    // when even the fallback response is not available,
    // there is nothing we can do, but we must always return a Response object
    return new Response(`Network error happened: ${String(error)}`, {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const preloadProc = async (
  request: Request,
  preloadResponse: Promise<Response | undefined> | undefined,
): Promise<Response> => (await usePreload(request, preloadResponse)) ?? fetch(request);

self.addEventListener(
  'fetch',
  (event: FetchEvent): void => {
    const request = event.request;

    // Cross origins are not processed
    if (new URL(request.url).origin !== self.origin) {
      return;
    }

    const isPreload = event.preloadResponse;

    if (!skipDestination.has(request.destination)) {
      event.respondWith(cacheFirst(request, isPreload));
      return;
    }

    // Only chrome-based browsers can use `preloadResponse` (as of May 2024).
    // If you are using this, you must pass `respondWith()` or you will get an error output to the browser console...
    //
    // It would be easy to simply disable it, but that wouldn't be fun either, would it?
    if (isPreload !== undefined) {
      event.respondWith(preloadProc(request, isPreload));
    }
  },
  { once: false, passive: true },
);
