const CACHE_VERSION = 'v0.25.0';

const CACHE_URL = '/commentary/';
const CACHE_LIST = [
  'book.js',
  'hl-worker.js',
  'wasm_book_bg.wasm',

  'css/general.css',
  'css/style.css',

  'manifest.json',
  'searchindex.json',

  'apple-touch-icon.png',
  'favicon.ico',
  'favicon.svg',

  'woff/OpenSans-Bold.woff2',
  'woff/OpenSans-BoldItalic.woff2',
  'woff/OpenSans-Italic.woff2',
  'woff/OpenSans-Regular.woff2',
  'woff/SourceCodePro-Medium.woff2',
  'woff/NerdFontsSymbolsOnly/SymbolsNerdFontMono-Regular.woff2',
];

const CACHE_USE = ['https://coralpink.github.io/', 'http://127.0.0.1:8080/'];

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);

  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  const preloadResponse = await preloadResponsePromise;

  const putInCache = async (request, response) => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response);
  };

  if (preloadResponse) {
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

const deleteCache = async key => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [CACHE_VERSION];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());

  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })(),
  );
  event.waitUntil(deleteOldCaches());
});

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

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      if (shouldSkipWaiting(await caches.keys())) {
        self.skipWaiting();
      }
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(CACHE_LIST.map(x => CACHE_URL + x));
    })(),
  );
});

self.addEventListener('fetch', async event => {
  for (const x of CACHE_USE) {
    if (!event.request.url.startsWith(x)) {
      continue;
    }

    const preloadResponsePromise = event.preloadResponse;

    event.respondWith(
      (async () => {
        const preloadResponse = await preloadResponsePromise;

        // Non-blocking cacheFirst function
        const cachedResponse = await cacheFirst({
          request: event.request,
          preloadResponsePromise: preloadResponse,
          fallbackUrl: `${CACHE_URL}chrome-96x96.png`,
        });

        return cachedResponse;
      })(),
    );

    // Ensure that the event does not finish until the respondWith promise settles
    event.waitUntil(preloadResponsePromise);
  }
});
