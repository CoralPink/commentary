import { type Disposer } from './types.ts';

import { type NavigationContext, prepareNavigation } from '../context.ts';
import { externalLinkProc, isExternalLink, isInternalLink } from '../link.ts';
import { updateActive } from '../sidebar.ts';

const PAGE_NO_TITLE = '(No Title) - Commentary of Dotfiles';

const dataLayer = ((globalThis as { dataLayer?: DataLayerEvent[] }).dataLayer ??= []);

const runTransition =
  'startViewTransition' in document ? (fn: () => void) => document.startViewTransition(fn) : (fn: () => void) => fn();

let currentUrl = new URL(globalThis.location.href);

let onNavigate: ((url: URL) => void) | null = null;

const setOnNavigate = (cb: (url: URL) => void): void => {
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

const applyNavigation = (ctx: NavigationContext, fromPopstate: boolean): void => {
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

  article.dispatchEvent(new Event('content-ready', { bubbles: true }));

  // If the transition originates from `popstate`, leave the scroll position to the browser
  if (fromPopstate) {
    return;
  }

  requestAnimationFrame((): void => {
    if (!ctx.next.hash) {
      article.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const header = article.querySelector(ctx.next.hash);
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

const navigateTo = async (next: URL, fromPopstate = false): Promise<void> => {
  if (next.pathname === currentUrl.pathname) {
    return;
  }

  const ctx = await prepareNavigation(next);

  if (ctx === null) {
    return;
  }

  runTransition(() => applyNavigation(ctx, fromPopstate));
  finalizeNavigation(ctx);

  if (!fromPopstate) {
    pushHistoryState(ctx);
  }

  currentUrl = next;
};

const popStateHandler = (ev: PopStateEvent): void => {
  const path = ev.state?.path ?? globalThis.location.pathname;

  navigateTo(new URL(path, globalThis.location.origin), true);
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

  if (isExternalLink(anchor)) {
    externalLinkProc(anchor);
    return;
  }

  if (!isInternalLink(anchor)) {
    return;
  }

  ev.preventDefault();
  navigateTo(new URL(anchor.href));
};

const jumpInternalHandler = (ev: Event): void => {
  const detail = (ev as CustomEvent<{ url: URL }>).detail;
  navigateTo(detail.url);
};

export const initialize = (_html: HTMLElement): Disposer => {
  setOnNavigate(updateActive);

  globalThis.addEventListener('popstate', popStateHandler, {
    once: false,
    passive: true,
  });

  document.addEventListener('click', clickHandler, {
    once: false,
    passive: false,
  });

  document.addEventListener('jump_internal', jumpInternalHandler, {
    once: false,
    passive: true,
  });

  return () => {
    // Do not remove the event listeners registered during this initialization process!!
  };
};
