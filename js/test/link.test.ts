import { beforeEach, describe, expect, it } from 'vitest';
import { enhanceLinks } from '../link.ts';

describe('enhanceLinks', () => {
  let article: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    article = document.createElement('article');
    document.body.appendChild(article);
  });

  it('sets target/rel for external http(s) links', () => {
    const EXTERNAL = ['http://example.com', 'https://example.com', 'https://example.com/abc.html'];

    for (const href of EXTERNAL) {
      const a = document.createElement('a');
      a.href = href;
      article.appendChild(a);
    }

    enhanceLinks(article);

    for (const link of article.querySelectorAll('a')) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener');
    }
  });

  it('normalizes internal links using ROOT_PATH', () => {
    const html = document.createElement('article');
    html.innerHTML = `
    <a href="foo.html"></a>
    <a href="../bar.html"></a>
  `;

    enhanceLinks(html);

    for (const link of html.querySelectorAll('a')) {
      expect(link.href).toMatch(/^https?:\/\//);
    }
  });

  it('keeps native links untouched (#hash or custom scheme)', () => {
    const NATIVE = ['#1', '#section1', '#http', 'mailto:test@example.com', 'tel:090-1111-2222', 'javascript:void(0)'];

    for (const href of NATIVE) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      article.appendChild(a);
    }

    enhanceLinks(article);

    for (const link of article.querySelectorAll('a')) {
      expect(link.getAttribute('target')).toBeNull();
      expect(link.getAttribute('href')).toBe(NATIVE.shift());
    }
  });

  it('does nothing safely even if html has no <a>', () => {
    const emptyDiv = document.createElement('div');
    expect(() => enhanceLinks(emptyDiv)).not.toThrow();
  });
});
