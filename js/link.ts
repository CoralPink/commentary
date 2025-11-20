import { ROOT_PATH } from './constants.ts';
import { navigateTo } from './navigate.ts';

const resolveUrl = (href: string): string => new URL(href.replace(/^(\.\.\/)+/, ''), ROOT_PATH).href;

const setExternalLink = (elm: HTMLAnchorElement): void => {
  elm.setAttribute('target', '_blank');
  elm.setAttribute('rel', 'noopener');
};

export const enhanceLinks = () => {
  const article = document.getElementById('article');

  if (!article) {
    return;
  }

  for (const x of article.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = x.getAttribute('href');

    if (!href) {
      console.error('link: not found href');
      continue;
    }

    if (href.startsWith('http://') || href.startsWith('https://')) {
      setExternalLink(x);
      continue;
    }

    // In-page anchors and non-http(s) schemes should keep their native behavior.
    if (href.startsWith('#') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) {
      continue;
    }

    const linkUrlStr = resolveUrl(href);
    const linkUrl = new URL(linkUrlStr);

    x.href = linkUrl.href;

    // Internal link
    x.addEventListener(
      'click',
      (ev: MouseEvent) => {
        if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) {
          return;
        }

        ev.preventDefault();

        navigateTo(linkUrl);
      },
      { once: false, passive: false },
    );
  }
};
