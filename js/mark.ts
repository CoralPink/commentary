// deno-lint-ignore no-sloppy-imports
import initWasm, { get_match_range } from './wasm_book.js';

const TAG_MARK = 'mark';

type RangeIndex = {
  start: number;
  end: number;
  matched: string;
  term: string;
};

type MatchResult = {
  index: RangeIndex[];
  hadMatch: boolean;
};

const getTextNodes = (element: HTMLElement): Text[] => {
  const textNodes: Text[] = [];

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  return textNodes;
};

export const unmarking = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    console.error('unmarking: Article element not found');
    return;
  }

  for (const x of Array.from(article.querySelectorAll(TAG_MARK))) {
    x.removeEventListener('click', unmarking);

    const parent = x.parentNode;

    if (!parent) {
      continue;
    }

    while (x.firstChild) {
      parent.insertBefore(x.firstChild, x);
    }
    parent.removeChild(x);
  }
};

const marking = async (element: HTMLElement, terms: string[]): Promise<void> => {
  if (terms.length === 0) {
    return;
  }

  try {
    await initWasm();
  } catch (error) {
    console.error('marking: ', error);
    return;
  }

  for (const node of getTextNodes(element)) {
    const textContent = node.textContent;

    if (!node.parentNode || !textContent) {
      continue;
    }

    const result: MatchResult = get_match_range(terms.join(' '), textContent);

    if (!result.hadMatch) {
      continue;
    }

    const fragment = document.createDocumentFragment();

    let currentPos = 0;

    for (const x of result.index) {
      if (x.start > currentPos) {
        fragment.appendChild(document.createTextNode(textContent.slice(currentPos, x.start)));
      }

      const mark = document.createElement(TAG_MARK);
      mark.textContent = x.matched;
      mark.addEventListener('click', unmarking, { once: true, passive: true });

      fragment.appendChild(mark);

      currentPos = x.end;
    }

    if (currentPos < textContent.length) {
      fragment.appendChild(document.createTextNode(textContent.slice(currentPos)));
    }

    node.parentNode.replaceChild(fragment, node);
  }
};

const splitParams = (s: string): string[] =>
  s
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

export const initMark = (element: HTMLElement): void => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }

  marking(element, splitParams(params));
};

export const updateMark = (id: string): void => {
  const elm = document.getElementById(id);

  if (!elm) {
    console.error(`updateMark: ${id} element not found`);
    return;
  }

  initMark(elm);
};
