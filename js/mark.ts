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

const TARGET_MARKING = 'marking';

let elmMarking: HTMLElement[];

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

export const updateMark = (): void => {
  const element = document.getElementById('article');

  if (!element) {
    console.error(`updateMark: article element not found`);
    return;
  }
  initMark(element);
};

export const unmarking = (): void => {
  CSS.highlights.clear();

  for (const x of elmMarking) {
    const icon = x.querySelector('.icon-marker') as HTMLDivElement;
    icon.style.backgroundColor = 'var(--icons)';

    x.setAttribute('aria-pressed', 'false');

    x.removeEventListener('click', unmarking);
    x.addEventListener('click', updateMark, { once: true, passive: true });
  }
};

export const marking = (element: HTMLElement, term: string): void => {
  const highlight = calcHighlight(element, term);

  if (!highlight.result.hadMatch) {
    unmarking();
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

  CSS.highlights.set(TARGET_MARKING, new Highlight(...ranges));

  for (const x of elmMarking) {
    const icon = x.querySelector('.icon-marker') as HTMLDivElement;
    icon.style.backgroundColor = 'var(--search-mark-bg)';

    x.setAttribute('aria-pressed', 'true');

    x.classList.remove('hidden');
    x.addEventListener('click', unmarking, { once: true, passive: true });
  }
};

const hideButton = () => {
  for (const x of elmMarking) {
    x.classList.add('hidden');

    x.removeEventListener('click', unmarking);
    x.removeEventListener('click', updateMark);
  }
};

export const initMark = async (element: HTMLElement): Promise<void> => {
  elmMarking = Array.from(document.querySelectorAll(`[data-target="${TARGET_MARKING}"]`));

  const param = new URLSearchParams(globalThis.location.search).get('mark');

  if (!param) {
    unmarking();
    hideButton();

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
