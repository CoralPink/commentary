/// <reference lib="dom" />

import { doSearchOrMarkFromUrl, unmarkHandler } from '../mark';
import { test, describe, it, expect, beforeEach } from 'bun:test';

describe('highlightTextNodesSimple', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="article"><p>This is a lazy dog and a required task.</p></div>`;

    // Imitate location to affect URLSearchParams
    Object.defineProperty(window, 'location', {
      value: new URL(`https://example.com/?mark=${encodeURIComponent('lazy required')}`),
      writable: true,
    });
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

test("does nothing if no 'mark' param in URL", () => {
  document.body.innerHTML = `
    <div id="article">
      <p>This is a test</p>
    </div>
  `;

  Object.defineProperty(globalThis, 'location', {
    value: new URL('https://example.com/'),
    writable: true,
  });

  expect(() => doSearchOrMarkFromUrl()).not.toThrow();
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

test('does nothing if article element is not found', () => {
  document.getElementById('article')?.remove();

  Object.defineProperty(globalThis, 'location', {
    value: new URL('https://example.com/?mark=lazy'),
    writable: true,
  });

  expect(() => doSearchOrMarkFromUrl()).not.toThrow();
  expect(() => unmarkHandler()).not.toThrow();
});
