import { CONTENT_READY, USE_LEGACY_NAVIGATION } from './constants.ts';
import { type NavigationContext, prepareNavigation } from './context.ts';
import { externalLinkProc, isExternalLink } from './link.ts';
import { bootThemeColor } from './theme-selector.ts';

const PAGE_NO_TITLE = '(No Title) - Commentary of Dotfiles';

const dataLayer = ((globalThis as { dataLayer?: DataLayerEvent[] }).dataLayer ??= []);

const pushPageViewEvent = (ctx: NavigationContext): void => {
  dataLayer.push({
    event: 'page_view',
    page_path: ctx.next.pathname,
    page_title: ctx.title.textContent ?? PAGE_NO_TITLE,
  });
};

let currentUrl = new URL(globalThis.location.href);

const forceReload = (url: URL, msg: string = 'forceReload'): void => {
  location.href = url.href;
  console.warn(msg);
};

const applyNavigation = (ctx: NavigationContext, navigationType: string): void => {
  const article = document.getElementById('article');

  if (!article) {
    forceReload(ctx.next, 'applyContent: not found article');
    return;
  }

  document.title = ctx.title.textContent ?? PAGE_NO_TITLE;
  article.innerHTML = ctx.article.innerHTML;

  article.dispatchEvent(new Event(CONTENT_READY, { bubbles: true }));

  // If it is a transition from a history entry, leave the scroll position to the browser
  if (navigationType === 'traverse') {
    return;
  }

  pushPageViewEvent(ctx);

  requestAnimationFrame((): void => {
    if (!ctx.next.hash) {
      article.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const header = article.querySelector(decodeURIComponent(ctx.next.hash));
    header?.scrollIntoView({ behavior: 'auto' });
  });
};

// @ts-expect-error: deno-ts does not yet recognize the Navigation API.
const navigateProc = (ev: NavigationNavigateEvent): void => {
  if (!ev.canIntercept || ev.downloadRequest !== null) {
    return;
  }

  const next = new URL(ev.destination.url);

  if (next.pathname === currentUrl.pathname) {
    return;
  }

  ev.intercept({
    async handler(): Promise<void> {
      const ctx = await prepareNavigation(next);

      if (!ctx) {
        forceReload(next, 'prepareNavigation: The necessary elements are missing.');
        return;
      }

      document.startViewTransition(() => {
        applyNavigation(ctx, ev.navigationType);
      });

      currentUrl = next;
    },
    scroll: ev.navigationType === 'traverse' ? 'after-transition' : 'manual',
  });
};

const prepareExternalLink = (ev: MouseEvent): void => {
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

  if (!isExternalLink(anchor)) {
    return;
  }
  externalLinkProc(anchor);
};

(() => {
  // The `theme color` startup process returns a promise, but you don't need to wait for it to complete.
  bootThemeColor();

  if (USE_LEGACY_NAVIGATION) {
    console.info('Shortly after the release of Firefox 147, this browser will no longer be supported on this site.');
    return;
  }

  // @ts-expect-error: deno-ts does not yet recognize the Navigation API.
  navigation.addEventListener('navigate', navigateProc, {
    once: false,
    passive: true,
  });

  document.addEventListener('click', prepareExternalLink, {
    once: false,
    passive: true,
  });
})();
