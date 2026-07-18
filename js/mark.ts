import { isSearchPopoverOpen } from './searcher.ts';
// deno-lint-ignore no-sloppy-imports
import initWasm, { get_match_sentences } from './wasm_book.js';

type NodeOffset = {
  text: Text;
  start: number;
  end: number;
};

type Utf16Range = {
  start: number;
  end: number;
};

type MatchResult = {
  index: Utf16Range[];
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

const TARGET_MARK_BUTTON = 'mark-btn';

const markEventScope = (() => {
  let controller: AbortController | null = null;

  const dispose = (): void => {
    controller?.abort();
    controller = null;
  };

  const begin = (): AbortSignal => {
    dispose();

    controller = new AbortController();
    return controller.signal;
  };

  return {
    begin,
    dispose,
  };
})();

// Fail Fast
const markButton = document.getElementById(TARGET_MARK_BUTTON);
if (markButton === null) {
  throw new Error('Missing Mark Button');
}

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
      if (!isSearchPopoverOpen()) {
        updateMark();
      }
      break;
  }
};

const keyClear = (ev: KeyboardEvent): void => {
  switch (ev.key) {
    case 'm':
    case 'M':
      if (!isSearchPopoverOpen()) {
        unmarking();
      }
      break;
  }
};

const setIconColor = (color: string): void => {
  const icon = markButton.querySelector(QUERY_MARKER) as HTMLDivElement;
  icon.style.backgroundColor = color;
};

export const unmarking = (): void => {
  CSS.highlights.clear();
  setIconColor(ICONS_COLOR);

  markButton.ariaPressed = 'false';

  const signal = markEventScope.begin();

  markButton.addEventListener('click', updateMark, {
    passive: true,
    signal,
  });

  document.addEventListener('keyup', keyVisible, {
    passive: true,
    signal,
  });
};

const hideButton = (): void => {
  markEventScope.dispose();
  CSS.highlights.clear();

  markButton.classList.add('hidden');
};

const visibleButton = (): void => {
  const signal = markEventScope.begin();
  setIconColor(ICONS_COLOR_ACTIVE);

  markButton.ariaPressed = 'true';
  markButton.classList.remove('hidden');

  markButton.addEventListener('click', unmarking, {
    passive: true,
    signal,
  });

  document.addEventListener('keyup', keyClear, {
    passive: true,
    signal,
  });
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
