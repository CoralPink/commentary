declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v9.2.6';

const CACHE_URL = '/commentary/';
const FALLBACK_IMAGE = 'favicon.png';

const installList: readonly string[] = [
  'favicon.png',
  'favicon.svg',
  'navigation.js',

  'css/general.css',
  'css/style.css',
  'css/catppuccin/latte.css',
  'css/catppuccin/macchiato.css',

  'woff2/OpenSans-BoldItalic.woff2',
  'woff2/OpenSans-Italic.woff2',
  'woff2/FiraCode-VF.woff2',
];

const faviconFiles = new Set(['favicon.png', 'favicon.svg']);
const skipDestination = new Set<RequestDestination>(['document', 'image', 'video', 'audio', '']);

const extractVersionParts = (cacheName: string): { major: number; minor: number } | null => {
  const m = cacheName.match(/^v(\d+)\.(\d+)/);

  if (!m) {
    return null;
  }
  return { major: Number(m[1]), minor: Number(m[2]) };
};

const shouldSkipWaiting = (cacheList: string[]): boolean => {
  const target = extractVersionParts(CACHE_VERSION);

  if (!target) {
    return false;
  }

  return cacheList.some(cacheName => {
    const current = extractVersionParts(cacheName);

    if (!current) {
      return false;
    }
    return current.major < target.major || (current.major === target.major && current.minor < target.minor);
  });
};

self.addEventListener('install', (event: ExtendableEvent): void => {
  event.waitUntil(
    (async (): Promise<void> => {
      if (shouldSkipWaiting(await caches.keys())) {
        self.skipWaiting();
      }
      const cache = await caches.open(CACHE_VERSION);

      await Promise.allSettled(
        installList.map(path => cache.add(CACHE_URL + path).catch(e => console.warn('Precache failed:', path, e))),
      );
    })(),
  );
});

const deleteOldCaches = async (): Promise<void> => {
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(key => key.startsWith('v') && key !== CACHE_VERSION);

  await Promise.all(cachesToDelete.map(key => caches.delete(key)));
};

const enablePreload = async (): Promise<void> => {
  if ('navigationPreload' in self.registration) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event: ExtendableEvent): void => {
  event.waitUntil(Promise.all([self.clients.claim(), enablePreload(), deleteOldCaches()]));
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

const cacheFirst = async (request: Request, preloadResponse: Promise<Response | undefined>): Promise<Response> => {
  // 1. get the resource from the cache
  const responseFromCache = await caches.match(request);

  if (responseFromCache) {
    return responseFromCache;
  }

  // 2. use the preloaded response, if it's there
  const preload = await usePreload(request, preloadResponse, true);

  if (preload) {
    return preload;
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

const requestProc = (request: Request, url: URL): Request => {
  const fileName = url.pathname.split('/').pop();

  // Rewrite requests for favicons to always use the top-level directory.
  if (fileName && faviconFiles.has(fileName)) {
    return new Request(self.location.origin + CACHE_URL + fileName);
  }

  return request;
};

self.addEventListener('fetch', (event: FetchEvent): void => {
  const url = new URL(event.request.url);

  // Cross origins are not processed
  if (url.origin !== self.location.origin) {
    return;
  }

  const request = requestProc(event.request, url);
  const response = skipDestination.has(request.destination) ? preloadProc : cacheFirst;

  event.respondWith(
    response(
      request,
      event.preloadResponse?.catch(() => undefined),
    ),
  );
});
