import { ROOT_PATH } from './constants.ts';

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
  const href = elm.getAttribute('href');

  if (!href) {
    console.error('link: not found href');
    return LinkKind.Undefined;
  }

  if (isHttpScheme(href)) {
    return href.startsWith(ROOT_PATH) ? LinkKind.Internal : LinkKind.External;
  }

  if (href.startsWith('#') || hasScheme(href)) {
    return LinkKind.Native;
  }

  return LinkKind.Internal;
};

export const externalLinkProc = (elm: HTMLAnchorElement): boolean => {
  if (getLinkKind(elm) !== LinkKind.External) {
    return false;
  }

  elm.setAttribute('target', '_blank');
  elm.setAttribute('rel', 'noopener');

  return true;
};

export const isInternalLink = (elm: HTMLAnchorElement): boolean => getLinkKind(elm) === LinkKind.Internal;
