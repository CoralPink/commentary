// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cacheAdd: vi.fn(),
  cachePut: vi.fn(),
  cacheOpen: vi.fn(),
  cacheMatch: vi.fn(),
  cacheKeys: vi.fn(),
  cacheDelete: vi.fn(),
  fetch: vi.fn(),
  skipWaiting: vi.fn(),
  clientsClaim: vi.fn(),
  preloadEnable: vi.fn(),
}));

type WorkerHandler = (event: unknown) => void;

const CACHE_VERSION = 'v11.20.2';
const CACHE_URL = '/commentary/';

const createRequest = (url: string, destination: RequestDestination = '', headers = new Headers()): Request =>
  ({ url, destination, headers }) as unknown as Request;

const createResponse = (
  status = 200,
): {
  response: Response;
  clone: Response;
} => {
  const clone = { status } as Response;
  const response = {
    status,
    clone: vi.fn(() => clone),
  } as unknown as Response;

  return { response, clone };
};

describe('serviceworker', () => {
  let handlers: Map<string, WorkerHandler>;
  let cache: Cache;
  let serviceWorker: object;

  beforeEach(async () => {
    vi.resetModules();

    mocks.cacheAdd.mockReset();
    mocks.cacheAdd.mockResolvedValue(undefined);

    mocks.cachePut.mockReset();
    mocks.cachePut.mockResolvedValue(undefined);

    mocks.cacheOpen.mockReset();

    mocks.cacheMatch.mockReset();
    mocks.cacheMatch.mockResolvedValue(undefined);

    mocks.cacheKeys.mockReset();
    mocks.cacheKeys.mockResolvedValue([]);

    mocks.cacheDelete.mockReset();
    mocks.cacheDelete.mockResolvedValue(true);

    mocks.fetch.mockReset();

    mocks.skipWaiting.mockReset();
    mocks.clientsClaim.mockReset();
    mocks.preloadEnable.mockReset();

    handlers = new Map();

    cache = {
      add: mocks.cacheAdd,
      put: mocks.cachePut,
    } as unknown as Cache;

    mocks.cacheOpen.mockResolvedValue(cache);

    serviceWorker = {
      location: new URL('https://example.test/'),
      registration: {
        navigationPreload: {
          enable: mocks.preloadEnable,
        },
      },
      clients: {
        claim: mocks.clientsClaim,
      },
      skipWaiting: mocks.skipWaiting,
      addEventListener: (type: string, listener: unknown) => {
        handlers.set(type, listener as WorkerHandler);
      },
    };

    vi.stubGlobal('self', serviceWorker);
    vi.stubGlobal('caches', {
      open: mocks.cacheOpen,
      match: mocks.cacheMatch,
      keys: mocks.cacheKeys,
      delete: mocks.cacheDelete,
    });
    vi.stubGlobal('fetch', mocks.fetch);

    await import('@/serviceworker.ts');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('precaches resources and skips waiting when an older cache exists', async () => {
    mocks.cacheKeys.mockResolvedValue(['v11.19.0', 'v10.0.0', 'other-cache']);

    let installPromise: Promise<void> | undefined;

    handlers.get('install')?.({
      waitUntil: (promise: Promise<void>) => {
        installPromise = promise;
      },
    });

    expect(installPromise).toBeDefined();
    await installPromise;

    expect(mocks.skipWaiting).toHaveBeenCalledOnce();
    expect(mocks.cacheOpen).toHaveBeenCalledWith(CACHE_VERSION);
    expect(mocks.cacheAdd).toHaveBeenCalledWith(`${CACHE_URL}favicon.png`);
    expect(mocks.cacheAdd).toHaveBeenCalledWith(`${CACHE_URL}initialize.js`);
    expect(mocks.cacheAdd).toHaveBeenCalledWith(`${CACHE_URL}wasm_book_bg.wasm`);
  });

  it('claims clients, enables navigation preload, and deletes old versioned caches', async () => {
    mocks.cacheKeys.mockResolvedValue([CACHE_VERSION, 'v11.19.0', 'v10.0.0', 'other-cache']);

    let activatePromise: Promise<unknown> | undefined;

    handlers.get('activate')?.({
      waitUntil: (promise: Promise<unknown>) => {
        activatePromise = promise;
      },
    });

    expect(activatePromise).toBeDefined();
    await activatePromise;

    expect(mocks.clientsClaim).toHaveBeenCalledOnce();
    expect(mocks.preloadEnable).toHaveBeenCalledOnce();
    expect(mocks.cacheDelete).toHaveBeenCalledTimes(2);
    expect(mocks.cacheDelete).toHaveBeenCalledWith('v11.19.0');
    expect(mocks.cacheDelete).toHaveBeenCalledWith('v10.0.0');
  });

  it('does not intercept cross-origin, video, or range requests', () => {
    const fetchHandler = handlers.get('fetch');
    expect(fetchHandler).toBeDefined();

    const makeEvent = (request: Request) => {
      const respondWith = vi.fn();

      return {
        event: {
          request,
          respondWith,
        },
        respondWith,
      };
    };

    const crossOrigin = makeEvent(createRequest('https://other.example/file.js', 'script'));
    fetchHandler!(crossOrigin.event);

    const video = makeEvent(createRequest('https://example.test/video.mp4', 'video'));
    fetchHandler!(video.event);

    const rangeHeaders = new Headers({ range: 'bytes=0-10' });
    const range = makeEvent(createRequest('https://example.test/file.js', 'script', rangeHeaders));
    fetchHandler!(range.event);

    expect(crossOrigin.respondWith).not.toHaveBeenCalled();
    expect(video.respondWith).not.toHaveBeenCalled();
    expect(range.respondWith).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('uses a navigation preload response without fetching from the network', async () => {
    const preloadResponse = { status: 200 } as Response;
    const request = createRequest('https://example.test/page', 'document');

    let responsePromise: Promise<Response> | undefined;

    handlers.get('fetch')?.({
      request,
      preloadResponse: Promise.resolve(preloadResponse),
      respondWith: (promise: Promise<Response>) => {
        responsePromise = promise;
      },
    });

    expect(responsePromise).toBeDefined();
    await expect(responsePromise).resolves.toBe(preloadResponse);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('fetches cacheable resources and stores successful network responses', async () => {
    const request = createRequest('https://example.test/app.js', 'script');
    const { response, clone } = createResponse();

    mocks.cacheMatch.mockResolvedValue(undefined);
    mocks.fetch.mockResolvedValue(response);

    let responsePromise: Promise<Response> | undefined;

    handlers.get('fetch')?.({
      request,
      preloadResponse: Promise.resolve(undefined),
      respondWith: (promise: Promise<Response>) => {
        responsePromise = promise;
      },
    });

    expect(responsePromise).toBeDefined();
    await expect(responsePromise).resolves.toBe(response);

    await Promise.resolve();

    expect(mocks.fetch).toHaveBeenCalledWith(request);
    expect(mocks.cacheOpen).toHaveBeenCalledWith(CACHE_VERSION);
    expect(mocks.cachePut).toHaveBeenCalledWith(request, clone);
  });

  it('returns the fallback image when the network request fails', async () => {
    const request = createRequest('https://example.test/app.js', 'script');
    const fallback = { status: 200 } as Response;

    mocks.cacheMatch.mockImplementation((key: Request | string) =>
      key === `${CACHE_URL}favicon.png` ? Promise.resolve(fallback) : Promise.resolve(undefined),
    );
    mocks.fetch.mockRejectedValue(new Error('offline'));

    let responsePromise: Promise<Response> | undefined;

    handlers.get('fetch')?.({
      request,
      preloadResponse: Promise.resolve(undefined),
      respondWith: (promise: Promise<Response>) => {
        responsePromise = promise;
      },
    });

    expect(responsePromise).toBeDefined();
    await expect(responsePromise).resolves.toBe(fallback);
  });
});
