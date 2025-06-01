import initWasm, { get_match_range } from './wasm_book';

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
    const currentNode = walker.currentNode;

    if (currentNode.nodeType === Node.TEXT_NODE) {
      textNodes.push(currentNode as Text);
    }
  }

  return textNodes;
};

export const unmarking = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    console.error('unmarkHandler: Article element not found');
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

  await initWasm();

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
        const plainText = textContent.slice(currentPos, x.start);
        fragment.appendChild(document.createTextNode(plainText));
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

export const doMarkFromUrl = (): void => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }

  const article = document.getElementById('article');

  if (article === null) {
    console.error('marking: Article element not found');
    return;
  }

  marking(article, params.trim().split(/\s+/));
};
