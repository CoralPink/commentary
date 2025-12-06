import { initCodeBlock } from './codeblock.ts';
import { isNativeLink } from './link.ts';
import { disposeAll, initModules } from './initialize.ts';
import { startupSearch } from './searcher.ts';
import { initSidebar, updateActive } from './sidebar.ts';
import { initTableOfContents } from './table-of-contents.ts';
import { initThemeColor } from './theme-selector.ts';

import { fetchText } from './utils/fetch.ts';
import { getUUID, type UUID } from './utils/random.ts';

type NavigationContext = {
  id: UUID;
  next: URL;
  article: HTMLElement;
  title: HTMLTitleElement;
};

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

const PAGE_NO_TITLE = '(No Title) - Commentary of Dotfiles'

let currentUrl = new URL(globalThis.location.href);
let currentNavigation: UUID;

// If not the latest navigate, abort
const isStaleNavigation = (id: UUID): boolean => currentNavigation !== id;

const forceReload = (url: URL, msg: string = 'forceReload'): void => {
  console.warn(msg);
  location.href = url.href;
};

const prepareNavigation = async (next: URL): Promise<NavigationContext | null> => {
  if (next.pathname === currentUrl.pathname) {
    return null;
  }

  const id = getUUID();
  currentNavigation = id;

  let htmlText: string;

  try {
    htmlText = await fetchText(next.pathname);
  } catch (err) {
    forceReload(next, err instanceof Error ? err.message : String(err));
    return null;
  }

  if (isStaleNavigation(id)) {
    return null;
  }

  const parsed = new DOMParser().parseFromString(htmlText, 'text/html');

  const article = parsed.getElementById('article');
  const title = parsed.querySelector('title');

  if (!article || !title) {
    forceReload(next, 'navigateTo: required elements not found.');
    return null;
  }

  return { id, next, article, title };
};

const applyNavigation = (ctx: NavigationContext) => {
  if (isStaleNavigation(ctx.id)) {
    return;
  }
  disposeAll();

  const article = document.getElementById('article');

  if (!article) {
    forceReload(ctx.next, 'applyContent: not found article');
    return;
  }

  document.title = ctx.title.textContent ?? PAGE_NO_TITLE;
  article.innerHTML = ctx.article.innerHTML;

  initModules(article);

  article.scrollIntoView({ behavior: 'auto' });
};

const runTransition = (fn: () => void) => ('startViewTransition' in document ? document.startViewTransition(fn) : fn());

const finalizeNavigation = (ctx: NavigationContext) => {
  if (isStaleNavigation(ctx.id)) {
    return;
  }
  onNavigate?.(ctx.next);
};

const pushHistoryState = (next: URL, elmTitle: HTMLTitleElement) => {
  const path = next.pathname;
  const title = elmTitle.textContent ?? PAGE_NO_TITLE;

  history.pushState({ path, title }, '', next.href);
  pushPageViewEvent(path, title);
};

export const navigateTo = async (next: URL, pushHistory = true): Promise<void> => {
  const ctx = await prepareNavigation(next);

  if (ctx === null) {
    return;
  }

  runTransition(() => applyNavigation(ctx));
  finalizeNavigation(ctx);

  if (pushHistory) {
    pushHistoryState(next, ctx.title);
  }

  currentUrl = next;
};

const popStateHandler = (ev: PopStateEvent) => {
  const path = ev.state?.path ?? location.pathname;
  navigateTo(new URL(path, location.origin), false);
};

const clickHandler = (ev: MouseEvent): void => {
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
};

(() => {
  globalThis.addEventListener('popstate', popStateHandler, {
    once: false,
    passive: true,
  });

  setOnNavigate(updateActive);

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      initThemeColor();
      initSidebar();
      initTableOfContents();
      initCodeBlock();

      startupSearch();

      const article = document.getElementById('article');

      if (article === null) {
        console.error('Article element not found');
        return;
      }
      initModules(article);
    },
    { once: true, passive: true },
  );

  document.addEventListener('click', clickHandler, {
    once: false,
    passive: false,
  });

  // capture hover event in iOS
  if (globalThis.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, {
      once: false,
      passive: true,
    });
  }
})();
