import * as g from '../global.ts';

const isExternalLink = (elm: HTMLAnchorElement): boolean => {
  const rawHref = elm.getAttribute('href');

  if (!rawHref) {
    return false;
  }

  try {
    const url = new URL(rawHref, g.rootPath);

    return url.origin !== new URL(g.rootPath).origin;
  } catch {
    return false;
  }
};

export const LinkProc = (document: Document): void => {
  for (const elm of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (!isExternalLink(elm)) {
      continue;
    }

    elm.setAttribute('target', '_blank');
    elm.setAttribute('rel', 'noopener');
  }
};
