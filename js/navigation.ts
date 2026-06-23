import { CONTENT_READY } from './constants.ts';
import { type NavigationContext, prepareNavigation } from './context.ts';
import navigationState from './navigationState.ts';
import { bootThemeColor } from './theme-selector.ts';

import { setHTML } from './utils/html-sanitizer.ts';
import toast from './utils/toast.ts';

const PAGE_NO_TITLE = '(No Title) - Commentary of Dotfiles';

const resolveTitle = (title: string | null): string => {
  const trimmed = title?.trim();
  return trimmed ? trimmed : PAGE_NO_TITLE;
};

const dataLayer = ((globalThis as { dataLayer?: DataLayerEvent[] }).dataLayer ??= []);

const pushPageViewEvent = (ctx: NavigationContext): void => {
  dataLayer.push({
    event: 'page_view',
    page_path: ctx.next.pathname,
    page_title: ctx.title.textContent ?? PAGE_NO_TITLE,
  });
};

const loadError = (url: URL, msg: string = 'load error'): void => {
  toast.error(`failed: ${url.href}`);
  console.error(msg);
};

const applyContent = (ctx: NavigationContext): HTMLElement => {
  const article = document.getElementById('article');

  if (article === null) {
    loadError(ctx.next, 'applyContent: not found article');
    throw new Error('article not found');
  }

  document.title = resolveTitle(ctx.title.textContent);
  setHTML(article, ctx.article.innerHTML);

  return article;
};

const scheduleScroll = (ctx: NavigationContext): void => {
  requestAnimationFrame((): void => {
    const article = document.getElementById('article');

    if (article === null) {
      return;
    }

    if (!ctx.next.hash) {
      article.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const getHeaderFromHash = (hash: string): Element | null => {
      try {
        return article.querySelector(decodeURIComponent(hash));
      } catch {
        throw new Error('Invalid hash value');
      }
    };

    const header = getHeaderFromHash(ctx.next.hash);

    if (header === null) {
      return;
    }
    header.scrollIntoView({ behavior: 'auto' });
  });
};

const applyNavigation = (ctx: NavigationContext, navigationType: string): void => {
  const article = applyContent(ctx);
  article.dispatchEvent(new Event(CONTENT_READY, { bubbles: true }));

  // If it is a transition from a history entry, leave the scroll position to the browser
  if (navigationType === 'traverse') {
    return;
  }

  pushPageViewEvent(ctx);
  scheduleScroll(ctx);
};

const navigateProc = (ev: NavigateEvent): void => {
  if (!ev.canIntercept || ev.downloadRequest !== null) {
    return;
  }

  const next = new URL(ev.destination.url);

  if (navigationState.isSame(next)) {
    return;
  }

  ev.intercept({
    async handler(): Promise<void> {
      const ctx = await prepareNavigation(next);

      if (!ctx) {
        loadError(next, 'prepareNavigation: The necessary elements are missing.');
        return;
      }

      const transition = document.startViewTransition(() => {
        applyNavigation(ctx, ev.navigationType);
      });

      try {
        await transition.updateCallbackDone;
        navigationState.commit(next);
      } catch (err) {
        loadError(next, `applyNavigation failed: ${String(err)}`);
      }
    },
    scroll: ev.navigationType === 'traverse' ? 'after-transition' : 'manual',
  });
};

(() => {
  // The `theme color` startup process returns a promise, but you don't need to wait for it to complete.
  bootThemeColor();

  navigation.addEventListener('navigate', navigateProc, {
    passive: true,
  });
})();
