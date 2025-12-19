import { type NavigationContext, prepareNavigation } from './context.ts';
import { isNativeLink } from './link.ts';
import { initExtensions } from './initialize.ts';
import { updateActive } from './sidebar.ts';

const PAGE_NO_TITLE = '(No Title) - Commentary of Dotfiles';

const dataLayer = ((globalThis as { dataLayer?: DataLayerEvent[] }).dataLayer ??= []);

const runTransition =
  'startViewTransition' in document ? (fn: () => void) => document.startViewTransition(fn) : (fn: () => void) => fn();

let currentUrl = new URL(globalThis.location.href);

let onNavigate: ((url: URL) => void) | null = null;

export const setOnNavigate = (cb: (url: URL) => void): void => {
  onNavigate = cb;
};

const forceReload = (url: URL, msg: string = 'forceReload'): void => {
  location.href = url.href;
  console.warn(msg);
};

const pushPageViewEvent = (path: string, title: string): void => {
  dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_title: title,
  });
};

const applyNavigation = (ctx: NavigationContext): void => {
  if (ctx.generation.aborted) {
    return;
  }

  const article = document.getElementById('article');

  if (!article) {
    forceReload(ctx.next, 'applyContent: not found article');
    return;
  }

  document.title = ctx.title.textContent ?? PAGE_NO_TITLE;
  article.innerHTML = ctx.article.innerHTML;

  initExtensions(article);

  requestAnimationFrame((): void => {
    if (!ctx.next.hash) {
      article.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const header = document.querySelector(ctx.next.hash);
    header?.scrollIntoView({ behavior: 'auto' });
  });
};

const finalizeNavigation = (ctx: NavigationContext): void => {
  if (ctx.generation.aborted) {
    return;
  }
  onNavigate?.(ctx.next);
};

const pushHistoryState = (ctx: NavigationContext): void => {
  const path = ctx.next.pathname;
  const title = ctx.title.textContent ?? PAGE_NO_TITLE;

  history.pushState({ path, title }, '', ctx.next.href);
  pushPageViewEvent(path, title);
};

export const navigateTo = async (next: URL, pushHistory = true): Promise<void> => {
  if (next.pathname === currentUrl.pathname) {
    return;
  }

  const ctx = await prepareNavigation(next);

  if (ctx === null) {
    return;
  }

  runTransition(() => applyNavigation(ctx));
  finalizeNavigation(ctx);

  if (pushHistory) {
    pushHistoryState(ctx);
  }

  currentUrl = next;
};

const popStateHandler = (ev: PopStateEvent): void => {
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
  setOnNavigate(updateActive);

  globalThis.addEventListener('popstate', popStateHandler, {
    once: false,
    passive: true,
  });

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
