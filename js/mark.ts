// deno-lint-ignore no-sloppy-imports
import initWasm, { get_match_sentences } from './wasm_book.js';

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

const calcHighlight = (element: HTMLElement, term: string): Highlight => {
  const nodeOffsets: NodeOffset[] = [];
  let fullText = '';

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    const node = currentNode as Text;

    const start = fullText.length;
    fullText += node.textContent ?? '';

    const end = fullText.length;

    nodeOffsets.push({ node, start, end });

    currentNode = walker.nextNode();
  }

  try {
    const result = get_match_sentences(term, fullText);
    return { nodeOffsets, result };
  } catch (err: unknown) {
    console.error('calcHighlight: ', err);
    return { nodeOffsets: [], result: { index: [], hadMatch: false } };
  }
};

export const unmarking = (): void => {
  CSS.highlights.delete('marking');
};

export const marking = (element: HTMLElement, term: string): void => {
  const highlight = calcHighlight(element, term);

  if (!highlight.result.hadMatch) {
    return;
  }

  const ranges = highlight.result.index.flatMap(r =>
    highlight.nodeOffsets
      .filter(({ start, end }) => r.end > start && r.start < end)
      .map(({ node, start, end }) => {
        const range = new Range();

        range.setStart(node, Math.max(0, r.start - start));
        range.setEnd(node, Math.min(end - start, r.end - start));

        return range;
      }),
  );

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

  unmarking();
  marking(element, param);
};
