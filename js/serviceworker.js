const CACHE_VERSION = 'v3.9.1';

const CACHE_HOST = 'https://coralpink.github.io/';
const CACHE_URL = '/commentary/';

const CACHE_LIST = [
  'book.js',
  'hl-worker.js',
  'wasm_book_bg.wasm',

  'css/general.css',
  'css/style.css',

  'woff/OpenSans-BoldItalic.woff2',
  'woff/OpenSans-Italic.woff2',
  'woff/FiraCode-VF.woff2',

  'apple-touch-icon.png',
  'chrome-96x96.png',
  'favicon.ico',
  'favicon.svg',

  'manifest.json',
];

const FALLBACK_URL = `${CACHE_URL}chrome-96x96.png`;

const deleteCache = async key => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [CACHE_VERSION];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener(
  'activate',
  event => {
    event.waitUntil(clients.claim());

    event.waitUntil(
      (async () => {
        if (self.registration.navigationPreload) {
          await self.registration.navigationPreload.enable();
        }
      })(),
    );
    event.waitUntil(deleteOldCaches());
  },
  { once: false, passive: true },
);

const extractVersionParts = cacheName => {
  const versionString = cacheName.substring(1);
  const [major, minor] = versionString.split('.');
  return { major, minor };
};

const shouldSkipWaiting = cacheList => {
  const target = extractVersionParts(CACHE_VERSION);

  return cacheList.some(cacheName => {
    const current = extractVersionParts(cacheName);
    return current.major < target.major || (current.major === target.major && current.minor < target.minor);
  });
};

self.addEventListener(
  'install',
  event => {
    event.waitUntil(
      (async () => {
        if (shouldSkipWaiting(await caches.keys())) {
          self.skipWaiting();
        }
        const cache = await caches.open(CACHE_VERSION);
        await cache.addAll(CACHE_LIST.map(x => CACHE_URL + x));
      })(),
    );
  },
  { once: false, passive: true },
);

const putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response);
};

const cacheFirst = async (request, preloadResponse) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);

  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  const preloadResponsePromise = await preloadResponse;

  if (preloadResponsePromise) {
    putInCache(request, preloadResponsePromise.clone());
    return preloadResponsePromise;
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
    return new Response(`Network error happened: ${error}`, {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

self.addEventListener(
  'fetch',
  event => {
    if (!event.request.url.startsWith(CACHE_HOST)) {
      return;
    }
    if (event.request.destination === 'document') {
      return;
    }

    event.respondWith(
      (async () => {
        const cachedResponse = await cacheFirst(event.request, event.preloadResponse);
        return cachedResponse;
      })(),
    );
  },
  { once: false, passive: true },
);
