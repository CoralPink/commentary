import { beforeEach, describe, expect, it } from 'vitest';
import { externalLinkProc, getLinkKind, isExternalLink, isInternalLink, LinkKind } from '../link.ts';

const createAnchor = (href?: string): HTMLAnchorElement => {
  const a = document.createElement('a');

  if (href !== undefined) {
    a.setAttribute('href', href);
  }
  return a;
};

describe('getLinkKind', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com/base/index.html'),
      writable: true,
    });
  });

  it('If no href is present, it is undefined', () => {
    const a = createAnchor();
    expect(getLinkKind(a)).toBe(LinkKind.Undefined);
  });

  it('hash link is Native', () => {
    const a = createAnchor('#section');
    expect(getLinkKind(a)).toBe(LinkKind.Native);
  });

  it('mailto is Native', () => {
    const a = createAnchor('mailto:test@example.com');
    expect(getLinkKind(a)).toBe(LinkKind.Native);
  });

  it('tel is Native', () => {
    const a = createAnchor('tel:09000000000');
    expect(getLinkKind(a)).toBe(LinkKind.Native);
  });

  it('Internal .html files are LinkKind.Internal', () => {
    const a = createAnchor('/about.html');
    expect(getLinkKind(a)).toBe(LinkKind.Internal);
  });

  it('Internal .html + query/hash are LinkKind.Internal', () => {
    const a = createAnchor('/about.html?x=1#top');
    expect(getLinkKind(a)).toBe(LinkKind.Internal);
  });

  it('Internal except .html files are LinkKind.External', () => {
    const a = createAnchor('/movie.webm');
    expect(getLinkKind(a)).toBe(LinkKind.External);
  });

  it('External sites are LinkKind.External', () => {
    const a = createAnchor('https://other.example.com/page.html');
    expect(getLinkKind(a)).toBe(LinkKind.External);
  });

  it('The relative path html is Internal', () => {
    const a = createAnchor('./foo/bar.html');
    expect(getLinkKind(a)).toBe(LinkKind.Internal);
  });
});

describe('helper functions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com/'),
      writable: true,
    });
  });

  it('isInternalLink', () => {
    const a = createAnchor('/index.html');
    expect(isInternalLink(a)).toBe(true);
    expect(isExternalLink(a)).toBe(false);
  });

  it('isExternalLink: en', () => {
    const a = createAnchor('https://en.wikipedia.org/wiki/Wikipedia');
    expect(isExternalLink(a)).toBe(true);
    expect(isInternalLink(a)).toBe(false);
  });

  it('isExternalLink: ja', () => {
    const a = createAnchor('https://ja.wikipedia.org/wiki/ウィキペディア');
    expect(isExternalLink(a)).toBe(true);
    expect(isInternalLink(a)).toBe(false);
  });
});

describe('externalLinkProc', () => {
  it('Set the target and rel attributes', () => {
    const a = createAnchor('https://example.com/');
    externalLinkProc(a);

    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
  });
});
