/// <reference lib="dom" />

import { describe, expect, it, beforeEach } from 'vitest';
import { attributeExternalLinks } from '../link';

const TEST_URLS = [
  'http://example.com',
  'https://example.com',
  'https://example.com/abc.html',
  'example.html',
  '../example.html',
  '#1',
  'http.html',
  'http/example.html',
  '#http',
];

describe('attributeExternalLinks', () => {
  beforeEach(() => {
    // Clear document.body for each test
    document.body.innerHTML = '';
  });

  it('adds _blank to external links', () => {
    const article = document.createElement('article');
    article.id = 'article';
    document.body.appendChild(article);

    for (const href of TEST_URLS) {
      const a = document.createElement('a');
      a.href = href;
      article.appendChild(a);
    }

    attributeExternalLinks();

    for (const link of Array.from(article.querySelectorAll('a'))) {
      const href = link.getAttribute('href');
      expect(href).not.toBeNull();

      if (href!.startsWith('http://') || href!.startsWith('https://')) {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener');
      } else {
        expect(link.getAttribute('target')).toBeNull();
      }
    }
  });

  it('does nothing if article element is not found', () => {
    document.getElementById('article')?.remove();
    expect(() => attributeExternalLinks()).not.toThrow();
  });
});
