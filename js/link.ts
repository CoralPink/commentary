const LinkKind = {
  External: 'external',
  Native: 'native',
  Internal: 'internal',
  Undefined: 'undefined',
} as const;

type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

const getLinkKind = (elm: HTMLAnchorElement): LinkKind => {
  const rawHref = elm.getAttribute('href');

  if (!rawHref) {
    console.error('link: not found href');
    return LinkKind.Undefined;
  }

  if (rawHref.startsWith('#')) {
    return LinkKind.Native;
  }

  let url: URL;

  try {
    url = new URL(rawHref, globalThis.location.href);
  } catch {
    // mailto:, tel:, invalid url
    return LinkKind.Native;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return LinkKind.Native;
  }

  if (url.origin === globalThis.location.origin) {
    return url.pathname.endsWith('.html') ? LinkKind.Internal : LinkKind.External;
  }
  return LinkKind.External;
};

export const externalLinkProc = (elm: HTMLAnchorElement): void => {
  elm.setAttribute('target', '_blank');
  elm.setAttribute('rel', 'noopener');
};

export const isExternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.External;
export const isInternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.Internal;
