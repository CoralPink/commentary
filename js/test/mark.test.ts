import { describe, it, expect, beforeEach } from 'bun:test';
import { doSearchOrMarkFromUrl, unmarkHandler } from '../mark';

const setupDom = (bodyHtml: string, markQuery: string) => {
  document.body.innerHTML = `<div id="article">${bodyHtml}</div>`;

  // Imitate location to affect URLSearchParams
  Object.defineProperty(window, 'location', {
    value: new URL(`https://example.com/?mark=${encodeURIComponent(markQuery)}`),
    writable: true,
  });
};

describe('highlightTextNodesSimple', () => {
  beforeEach(() => {
    setupDom('<p>This is a lazy dog and a required task.</p>', 'lazy required');
  });

  it('should wrap matched terms in <mark>', () => {
    doSearchOrMarkFromUrl();

    const article = document.getElementById('article')!;
    const marks = article.querySelectorAll('mark');

    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe('lazy');
    expect(marks[1].textContent).toBe('required');
  });

  it('should unmark terms on click', () => {
    doSearchOrMarkFromUrl();

    const article = document.getElementById('article')!;
    const marks = Array.from(article.querySelectorAll('mark'));

    for (const mark of marks) {
      mark.dispatchEvent(new window.Event('click'));
    }

    const newMarks = article.querySelectorAll('mark');
    expect(newMarks.length).toBe(0);
    expect(article.textContent).toContain('lazy');
    expect(article.textContent).toContain('required');
  });
});

describe('unmarkHandler', () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <div id="article">
      <p>This is a <mark>lazy</mark> dog and <mark>required</mark> task.</p>
    </div>
  `;
  });

  it('should unwrap all <mark> elements inside #article', () => {
    const article = document.getElementById('article')!;
    const marksBefore = article.querySelectorAll('mark');

    expect(marksBefore.length).toBe(2);

    for (const mark of Array.from(marksBefore)) {
      mark.addEventListener('click', unmarkHandler);
    }

    for (const mark of Array.from(marksBefore)) {
      mark.dispatchEvent(new window.Event('click'));
    }

    const marksAfter = article.querySelectorAll('mark');
    expect(marksAfter.length).toBe(0);

    const text = article.textContent;
    expect(text).toContain('lazy');
    expect(text).toContain('required');
  });
});
