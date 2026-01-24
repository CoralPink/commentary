export const LinkKind = {
  External: 'external',
  Native: 'native',
  Internal: 'internal',
  Undefined: 'undefined',
} as const;

type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

const isHttpProtocol = (s: URL): boolean => s.protocol === 'http:' || s.protocol === 'https:';

const hrefToURL = (href: string): URL | null => {
  try {
    return new URL(href, globalThis.location.href);
  } catch {
    // mailto:, tel:, invalid url
    return null;
  }
};

export const getLinkKind = (elm: HTMLAnchorElement): LinkKind => {
  const rawHref = elm.getAttribute('href');

  if (!rawHref) {
    console.error('link: not found href');
    return LinkKind.Undefined;
  }

  if (rawHref.startsWith('#')) {
    return LinkKind.Native;
  }

  const url = hrefToURL(rawHref);

  if (url === null || !isHttpProtocol(url)) {
    return LinkKind.Native;
  }
  if (url.origin === globalThis.location.origin) {
    return url.pathname.endsWith('.html') ? LinkKind.Internal : LinkKind.External;
  }
  return LinkKind.External;
};

export const isExternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.External;
export const isInternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.Internal;
