const CACHE_VERSION = 'v0.5.0';
const CACHE_LIST = [
  '/commentary/book.js',
  '/commentary/clipboard.min.js',
  '/commentary/elasticlunr.min.js',
  '/commentary/fzf.umd.js',
  '/commentary/highlight.min.js',
  '/commentary/manifest.json',
  '/commentary/mark.es6.min.js',
  '/commentary/searcher.js',
  '/commentary/searchindex.js',
  '/commentary/searchindex.json',

  '/commentary/wasm.js',
  '/commentary/wasm_bg.wasm',

  '/commentary/css/style.css',

  '/commentary/apple-touch-icon.png',
  '/commentary/chrome-96x96.png',
  '/commentary/chrome-192x192.png',
  '/commentary/chrome-512x512.png',
  '/commentary/favicon.ico',
  '/commentary/favicon.png',

  '/commentary/fonts/OpenSans-Bold.woff2',
  '/commentary/fonts/OpenSans-BoldItalic.woff2',
  '/commentary/fonts/OpenSans-Italic.woff2',
  '/commentary/fonts/OpenSans-Regular.woff2',
  '/commentary/fonts/SourceCodePro-Medium.woff2',
  '/commentary/fonts/fonts.css',
  '/commentary/fonts/icomoon.woff2',
  '/commentary/fonts/SauceCodePro/SauceCodeProNerdFont-Medium.woff2',
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

self.addEventListener('install', event => {
  // The promise that skipWaiting() returns can be safely ignored.
  self.skipWaiting();

  const addResourcesToCache = async resources => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(resources);
  };

  event.waitUntil(addResourcesToCache(CACHE_LIST));
});

self.addEventListener('fetch', async event => {
  CACHE_USE.forEach(x => {
    if (event.request.url.startsWith(x)) {
      event.respondWith(
        cacheFirst({
          request: event.request,
          preloadResponsePromise: event.preloadResponse,
          fallbackUrl: '/commentary/maskable_icon_x96.png',
        }),
      );
    }
  });
});
