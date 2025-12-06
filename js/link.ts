import { ROOT_PATH } from './constants.ts';
import { ID_SIDEBAR } from './sidebar.ts';

const LinkKind = {
  External: 'external',
  Native: 'native',
  Internal: 'internal',
  Undefined: 'undefined',
} as const;

type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

const hasScheme = (s: string): boolean => /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s);
const isHttpScheme = (s: string) => s.startsWith('http://') || s.startsWith('https://');

const getLinkKind = (elm: HTMLAnchorElement): LinkKind => {
  // In-page anchors and non-http(s) schemes should keep their native behavior.
  if (elm.closest(`#${ID_SIDEBAR}`)) {
    return LinkKind.Internal;
  }

  const href = elm.getAttribute('href');

  if (!href) {
    console.error('link: not found href');
    return LinkKind.Undefined;
  }

  if (isHttpScheme(href)) {
    return LinkKind.External;
  }
  if (href.startsWith('#') || hasScheme(href)) {
    return LinkKind.Native;
  }
  return LinkKind.Internal;
};

const setExternalLink = (elm: HTMLAnchorElement): void => {
  elm.setAttribute('target', '_blank');
  elm.setAttribute('rel', 'noopener');
};

const resolveUrl = (href: string): string => new URL(href.replace(/^(\.\.\/)+/, ''), ROOT_PATH).href;

const setInternalLink = (elm: HTMLAnchorElement): void => {
  const linkUrlStr = resolveUrl(elm.getAttribute('href')!);
  const linkUrl = new URL(linkUrlStr);

  elm.href = linkUrl.href;
};

export const enhanceLinks = (html:HTMLElement) => {
  for (const x of html.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const kind = getLinkKind(x);

    if (kind === LinkKind.External) {
      setExternalLink(x);
    } else if (kind === LinkKind.Internal) {
      setInternalLink(x);
    }
  }
};

export const isNativeLink = (elm: HTMLAnchorElement): boolean => {
  const kind = getLinkKind(elm);

  if (kind === LinkKind.External) {
    return !elm.href.startsWith(ROOT_PATH);
  }
  return kind === LinkKind.Native;
};
