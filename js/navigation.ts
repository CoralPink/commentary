import { initCodeBlock, registryCodeBlock } from './codeblock.ts';
import { ROOT_PATH } from './constants.ts';
import { fetchText } from './fetch.ts';
import { initFootnote } from './footnote.ts';
import { enhanceLinks, isNativeLink } from './link.ts';
import { doMarkFromUrl } from './mark.ts';
import { getRandomId } from './random.ts';
import { startupSearch } from './searcher.ts';
import { initSidebar, updateActive } from './sidebar.ts';
import { initTableOfContents, registryToc } from './table-of-contents.ts';
import { initThemeColor } from './theme-selector.ts';

const MODULE_REQUIREMENTS: { selector: string; module: string }[] = [
  { selector: '.slider', module: 'slider.js' },
  { selector: 'video', module: 'media.js' },
  // TODO: We will suspend use until a reliable method is found.
  // { selector: '.replace-element', module: 'replace-dom.js' },
];

type ModuleEntry = {
  importPromise: Promise<void>;

  // NOTE: If present, initialize() must be safe to call multiple times without leaking handlers or observers.
  initialize: (() => () => void) | undefined;
};

const loadedModules = new Map<string, ModuleEntry>();
const activeDisposers = new Set<() => void>();

const MEDIA_TAGS = [
  'img',
  'source', // (<audio>, <video>)
] as const;

const MEDIA_SELECTOR = MEDIA_TAGS.map(t => `${t}[src]`).join(', ');

let onNavigate: ((url: URL) => void) | null = null;

export const setOnNavigate = (cb: (url: URL) => void): void => {
  onNavigate = cb;
};

const dataLayer = ((globalThis as { dataLayer?: DataLayerEvent[] }).dataLayer ??= []);

export const pushPageViewEvent = (path: string, title: string): void => {
  dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_title: title,
  });
};

let currentUrl = new URL(location.href);
let currentNavigation: string;

const isStaleNavigation = (id: string): boolean => currentNavigation !== id;

const forceReload = (url: URL, msg: string = 'forceReload'): void => {
  console.warn(msg);
  location.href = url.href;
};

const disposeAll = () => {
  for (const fn of activeDisposers) {
    fn();
  }

  activeDisposers.clear();
};

const ensureModuleLoaded = (url: string): Promise<void> => {
  if (loadedModules.has(url)) {
    const entry = loadedModules.get(url)!;

    if (entry.initialize !== undefined) {
      const disposeFn = entry.initialize();
      activeDisposers.add(disposeFn);
    }
    return entry.importPromise;
  }

  const importPromise = import(url)
    .then(mod => {
      if (typeof mod.initialize !== 'function') {
        loadedModules.set(url, {
          importPromise,
          initialize: undefined,
        });
        return;
      }

      const initialize = mod.initialize;

      const disposeFn = initialize();
      activeDisposers.add(disposeFn);

      loadedModules.set(url, { importPromise, initialize });
    })
    .catch(err => {
      console.error(`Failed to load module: ${url}`, err);
      loadedModules.delete(url);
      throw err;
    });

  return importPromise;
};

const loadModules = async (): Promise<void> => {
  const require: Promise<void>[] = [];

  for (const req of MODULE_REQUIREMENTS) {
    const url = `${ROOT_PATH}${req.module}`;

    if (document.querySelector(req.selector)) {
      require.push(ensureModuleLoaded(url));
    }
  }

  await Promise.all(require);
};

export const initContents = async (): Promise<void> => {
  const promiseLoadModule = loadModules();

  const disposeTocFn = registryToc();
  activeDisposers.add(disposeTocFn);

  const disposeCodeFn = registryCodeBlock();
  activeDisposers.add(disposeCodeFn);

  doMarkFromUrl();
  enhanceLinks();
  initFootnote();

  await promiseLoadModule;
};

const setBaseUrl = (elm: Element, url: URL): void => {
  const baseUrl = new URL('./', url).href;

  for (const x of Array.from(elm.querySelectorAll(MEDIA_SELECTOR))) {
    const media = x as HTMLMediaElement;
    const src = media.getAttribute('src');

    if (src) {
      media.src = new URL(src, baseUrl).href;
    }
  }

  for (const x of Array.from(elm.querySelectorAll('video[data-poster]'))) {
    const video = x as HTMLVideoElement;
    const poster = video.getAttribute('data-poster');

    if (poster) {
      video.setAttribute('data-poster', new URL(poster, baseUrl).href);
    }
  }
};

export const navigateTo = async (next: URL, pushHistory = true): Promise<void> => {
  if (next.pathname === currentUrl.pathname) {
    return;
  }

  const id = getRandomId();
  currentNavigation = id;

  let htmlText: string;

  try {
    htmlText = await fetchText(next.pathname);
  } catch (err) {
    forceReload(next, err instanceof Error ? err.message : String(err));
    return;
  }

  // If not the latest navigate, abort
  if (isStaleNavigation(id)) {
    return;
  }

  const parsed = new DOMParser().parseFromString(htmlText, 'text/html');

  const newArticle = parsed.getElementById('article');
  const newTitle = parsed.querySelector('title');

  if (!newArticle || !newTitle) {
    forceReload(next, 'navigateTo: required elements not found in fetched HTML.');
    return;
  }

  setBaseUrl(newArticle, next);

  const applyContent = () => {
    // Eliminate old operations during ViewTransition
    if (isStaleNavigation(id)) {
      return;
    }
    const article = document.getElementById('article');

    if (!article) {
      forceReload(next, 'applyContent: not found article');
      return;
    }

    article.innerHTML = newArticle.innerHTML;
    document.title = newTitle.textContent;

    disposeAll();

    initContents().catch(err => {
      console.error('Failed to initialize page modules:', err);
    });

    article.scrollIntoView({ behavior: 'auto' });
  };

  'startViewTransition' in document ? document.startViewTransition(applyContent) : applyContent();

  // If the old navigate is used after replacement, do not add to history.
  if (isStaleNavigation(id)) {
    return;
  }

  if (onNavigate !== null) {
    onNavigate(next);
  }

  if (pushHistory) {
    if (isStaleNavigation(id)) {
      return;
    }
    history.pushState({ path: next.pathname, title: newTitle.textContent }, '', next.href);
    pushPageViewEvent(next.pathname, newTitle.textContent);
  }

  currentUrl = next;
};

(() => {
  globalThis.addEventListener(
    'popstate',
    (ev: PopStateEvent) => {
      const path = ev.state?.path ?? location.pathname;
      navigateTo(new URL(path, location.origin), false);
    },
    { once: false, passive: true },
  );

  setOnNavigate(updateActive);

  initSidebar();
  initTableOfContents();
  initCodeBlock();
  initThemeColor();

  startupSearch();

  document.addEventListener('DOMContentLoaded', initContents, {
    once: true,
    passive: true,
  });

  document.addEventListener(
    'click',
    (ev: MouseEvent) => {
      if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) {
        return;
      }

      const target = ev.target as Element;

      if (!target) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href]');

      if (!anchor) {
        return;
      }

      if (isNativeLink(anchor)) {
        return;
      }

      ev.preventDefault();
      navigateTo(new URL(anchor.href));
    },
    { once: false, passive: false },
  );

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, {
      once: false,
      passive: true,
    });
  }
})();
