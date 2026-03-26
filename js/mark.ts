// deno-lint-ignore no-sloppy-imports
import initWasm, { get_match_sentences } from './wasm_book.js';

type NodeOffset = {
  text: Text;
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

const QUERY_MARKER = '.icon-marker';
const TARGET_MARKING = 'marking';

const ICONS_COLOR = 'var(--icons)';
const ICONS_COLOR_ACTIVE = 'var(--search-mark-bg)';

export const updateMark = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    console.error(`updateMark: article element not found`);
    return;
  }

  initMark(article);
};

const keyVisible = (ev: KeyboardEvent): void => {
  switch (ev.key) {
    case 'm':
    case 'M':
      updateMark();
      break;
  }
};

const keyClear = (ev: KeyboardEvent): void => {
  switch (ev.key) {
    case 'm':
    case 'M':
      unmarking();
      break;
  }
};

export const unmarking = (): void => {
  CSS.highlights.clear();

  for (const x of Array.from(document.querySelectorAll(`[data-target="${TARGET_MARKING}"]`))) {
    const icon = x.querySelector(QUERY_MARKER) as HTMLDivElement;
    icon.style.backgroundColor = ICONS_COLOR;

    x.setAttribute('aria-pressed', 'false');

    x.removeEventListener('click', unmarking);
    x.addEventListener('click', updateMark, { once: true, passive: true });
  }

  document.removeEventListener('keyup', keyClear);
  document.addEventListener('keyup', keyVisible, {
    once: false,
    passive: true,
  });
};

const hideButton = (): void => {
  CSS.highlights.clear();

  for (const x of Array.from(document.querySelectorAll(`[data-target="${TARGET_MARKING}"]`))) {
    x.classList.add('hidden');

    x.removeEventListener('click', unmarking);
    x.removeEventListener('click', updateMark);
  }

  document.removeEventListener('keyup', keyVisible);
  document.removeEventListener('keyup', keyClear);
};

const visibleButton = (): void => {
  for (const x of Array.from(document.querySelectorAll(`[data-target="${TARGET_MARKING}"]`))) {
    const icon = x.querySelector(QUERY_MARKER) as HTMLDivElement;
    icon.style.backgroundColor = ICONS_COLOR_ACTIVE;

    x.setAttribute('aria-pressed', 'true');

    x.classList.remove('hidden');
    x.addEventListener('click', unmarking, { once: true, passive: true });

    document.removeEventListener('keyup', keyVisible);
    document.addEventListener('keyup', keyClear, {
      once: false,
      passive: true,
    });
  }
};

const generateNodeOffset = (element: HTMLElement): NodeOffset[] => {
  const nodeOffsets: NodeOffset[] = [];

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Node | null;

  let end = 0;

  while ((node = walker.nextNode())) {
    const start = end;
    const text = node.textContent ?? '';

    end += text.length;

    nodeOffsets.push({ text: node as Text, start, end });
  }

  return nodeOffsets;
};

const calcHighlight = async (element: HTMLElement, term: string): Promise<Highlight> => {
  const promiseInit = initWasm();
  const nodeOffsets = generateNodeOffset(element);

  try {
    await promiseInit;

    const result = get_match_sentences(term, element.textContent);

    return { nodeOffsets, result };
  } catch (err: unknown) {
    console.error('calcHighlight: ', err);
    return { nodeOffsets: [], result: { index: [], hadMatch: false } };
  }
};

const marking = async (element: HTMLElement, term: string): Promise<void> => {
  const highlight = await calcHighlight(element, term);

  if (!highlight.result.hadMatch) {
    hideButton();
    return;
  }

  const ranges = highlight.result.index.flatMap(r =>
    highlight.nodeOffsets
      .filter(({ start, end }) => r.end > start && r.start < end)
      .map(({ text, start, end }) => {
        const range = new Range();

        range.setStart(text, Math.max(0, r.start - start));
        range.setEnd(text, Math.min(end - start, r.end - start));

        return range;
      }),
  );

  CSS.highlights.set(TARGET_MARKING, new Highlight(...ranges));

  visibleButton();
};

export const initMark = (element: HTMLElement): void => {
  const param = new URLSearchParams(globalThis.location.search).get('mark');

  if (!param) {
    hideButton();
    return;
  }

  marking(element, param);
};
