export const LinkKind = {
  External: 'external',
  Native: 'native',
  Internal: 'internal',
  Undefined: 'undefined',
} as const;

type LinkKind = (typeof LinkKind)[keyof typeof LinkKind];

const isHttpProtocol = (s: URL): boolean => s.protocol === 'http:' || s.protocol === 'https:';

const getLinkKind = (elm: HTMLAnchorElement): LinkKind => {
  const rawHref = elm.getAttribute('href');

  if (!rawHref) {
    console.error('link: not found href');
    return LinkKind.Undefined;
  }
  if (rawHref.startsWith('#')) {
    return LinkKind.Native;
  }
  if (rawHref.startsWith('.') || rawHref.startsWith('/')) {
    return LinkKind.Internal;
  }

  try {
    const url = new URL(rawHref);
    return isHttpProtocol(url) ? LinkKind.External : LinkKind.Native;
  } catch {
    return LinkKind.Undefined;
  }
};

export const isExternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.External;
export const isInternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.Internal;
