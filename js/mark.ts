// deno-lint-ignore no-sloppy-imports
import initWasm, { get_match_range } from './wasm_book.js';

type NodeOffset = {
  node: Text;
  start: number;
  end: number;
};

type RangeIndex = {
  start: number;
  end: number;
};

type MatchResult = {
  index: RangeIndex[];
  hadMatch: boolean;
};

type Highlight = {
  nodeOffsets: NodeOffset[];
  result: MatchResult;
};

const calcHighlight = (element: HTMLElement, term: string, range: boolean): Highlight => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  let currentNode = walker.nextNode();
  let fullText = '';

  const nodeOffsets: NodeOffset[] = [];

  while (currentNode) {
    const node = currentNode as Text;

    const start = fullText.length;
    fullText += node.textContent ?? '';

    const end = fullText.length;

    nodeOffsets.push({ node, start, end });

    currentNode = walker.nextNode();
  }

  const result = get_match_range(term, fullText, range);

  return { nodeOffsets, result };
};

export const unmarking = (): void => {
  CSS.highlights.clear();
};

export const marking = (element: HTMLElement, term: string, range = true): void => {
  unmarking();

  const highlight = calcHighlight(element, term, range);

  if (!highlight.result.hadMatch) {
    return;
  }

  const ranges: Range[] = highlight.result.index.flatMap(r =>
    highlight.nodeOffsets
      .filter(({ start, end }) => r.end > start && r.start < end)
      .map(({ node, start, end }) => {
        const range = new Range();

        range.setStart(node, Math.max(0, r.start - start));
        range.setEnd(node, Math.min(end - start, r.end - start));

        return range;
      }),
  );

  if (ranges.length === 0) {
    return;
  }

  CSS.highlights.set('marking', new Highlight(...ranges));
};

export const initMark = async (element: HTMLElement): Promise<void> => {
  const param = new URLSearchParams(globalThis.location.search).get('mark');

  if (!param) {
    return;
  }

  try {
    await initWasm();
  } catch (err) {
    console.error('initMark: ', err);
    return;
  }

  marking(element, param);
};
