const TAG_MARK = 'mark';

type BestMatch = { index: number; term: string } | null;

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

const highlightTextNodesSimple = (element: HTMLElement, terms: string[]): void => {
  const textNodes = getTextNodes(element);

  for (const node of textNodes) {
    const text = node.textContent;

    if (!text) {
      continue;
    }

    const fragment = document.createDocumentFragment();

    let pos = 0;
    let foundMatch = false;

    while (pos < text.length) {
      let bestMatch: BestMatch = null;

      for (const term of terms) {
        const index = text.indexOf(term, pos);

        if (index !== -1 && (!bestMatch || index < bestMatch.index)) {
          bestMatch = { index, term };
        }
      }

      if (!bestMatch) {
        fragment.appendChild(document.createTextNode(text.slice(pos)));
        break;
      }

      foundMatch = true;

      if (bestMatch.index > pos) {
        fragment.appendChild(document.createTextNode(text.slice(pos, bestMatch.index)));
      }

      const mark = document.createElement('mark');
      mark.textContent = bestMatch.term;

      fragment.appendChild(mark);

      pos = bestMatch.index + bestMatch.term.length;
    }

    if (foundMatch && node.parentNode) {
      node.parentNode.replaceChild(fragment, node);
    }
  }
};

export const unmarkHandler = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    console.error('unmarkHandler: Article element not found');
    return;
  }

  for (const x of Array.from(article.querySelectorAll(TAG_MARK))) {
    x.removeEventListener('click', unmarkHandler);

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

export const doSearchOrMarkFromUrl = (): void => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }

  const article = document.getElementById('article');

  if (article === null) {
    console.error('marking: Article element not found');
    return;
  }

  const terms: string[] = params.trim().split(/\s+/);

  highlightTextNodesSimple(article, terms);

  for (const x of Array.from(article.querySelectorAll(TAG_MARK))) {
    x.addEventListener('click', unmarkHandler, { once: true, passive: true });
  }
};
