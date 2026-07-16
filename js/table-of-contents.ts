import { BREAKPOINT_UI_WIDE } from './constants.ts';

import { reverseItr } from './utils/generators.ts';

const Environment = {
  WIDE: 0,
  COMPACT: 1,
} as const;

type Environment = (typeof Environment)[keyof typeof Environment];

const tocClass = ['righttoc', 'bottomtoc'] as const;

const tocMap: Map<HTMLElement, HTMLAnchorElement> = new Map();

let elmToggle: HTMLButtonElement;
let elmToc: HTMLDivElement;

let environment: Environment;
let onlyActive: HTMLElement | null = null;

let currentInlineCenter: HTMLElement | null = null;

const scrollCenter = (): void => {
  if (environment === Environment.WIDE || currentInlineCenter === null) {
    return;
  }

  currentInlineCenter?.scrollIntoView({ inline: 'center' });
};

const addActive = (entry: IntersectionObserverEntry): void => {
  if (onlyActive !== null) {
    onlyActive.classList.remove('active');
    onlyActive = null;
  }

  const target = tocMap.get(entry.target as HTMLElement);

  if (target === undefined) {
    console.error(`addActive: ${entry.target} does not exist`);
    return;
  }
  target.classList.add('active');
  target.ariaCurrent = 'true';

  currentInlineCenter = target;
};

const removeActive = (entry: IntersectionObserverEntry): void => {
  let count = 0;
  let active: HTMLElement | null = null;

  for (const x of tocMap.values()) {
    if (x.classList.contains('active')) {
      count++;
      active = x;
    }
  }

  if (count <= 1) {
    onlyActive = active;
    return;
  }

  const target = tocMap.get(entry.target as HTMLElement);

  if (target === undefined) {
    console.error(`removeActive: ${entry.target} does not exist`);
    return;
  }
  target.classList.remove('active');
  target.ariaCurrent = null;
};

const jumpHeader = (ev: PointerEvent): void => {
  if (!(ev.target instanceof HTMLAnchorElement)) {
    return;
  }

  const id = ev.target.hash.slice(1);

  if (!id) {
    return;
  }

  const header = document.getElementById(decodeURIComponent(id));

  if (header === null) {
    return;
  }

  ev.preventDefault();
  history.replaceState(null, '', `#${header.id}`);
};

const tocReset = (): void => {
  elmToc.classList.remove(tocClass[environment]);

  environment = globalThis.innerWidth >= BREAKPOINT_UI_WIDE ? Environment.WIDE : Environment.COMPACT;
  elmToc.classList.add(tocClass[environment]);

  if (environment === Environment.WIDE) {
    tocVisible();
  }
};

const getHeaders = (h: HTMLElement): Array<HTMLAnchorElement> => Array.from(h.querySelectorAll('a.header'));

export const initTableOfContents = (html: HTMLElement): (() => void) => {
  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      for (const x of reverseItr(entries)) {
        x.isIntersecting ? addActive(x) : removeActive(x);
      }
      scrollCenter();
    },
    { threshold: 0.8 },
  );

  elmToc = document.getElementById('table-of-contents') as HTMLDivElement;
  elmToggle = document.getElementById('toc-toggle') as HTMLButtonElement;

  const fragment = document.createDocumentFragment();

  for (const el of getHeaders(html)) {
    observer.observe(el);

    const link: HTMLAnchorElement = document.createElement('a');
    link.textContent = el.text;
    link.href = el.hash;
    link.classList.add(el.parentElement?.tagName ?? '');

    tocMap.set(el, link);
    fragment.append(link);
  }

  const pageToc = document.getElementById('pagetoc') as HTMLDivElement;
  const ac = new AbortController();

  pageToc.append(fragment);

  pageToc.addEventListener('click', jumpHeader, {
    passive: false,
    signal: ac.signal,
  });

  return (): void => {
    observer.disconnect();
    tocMap.clear();
    ac.abort();

    pageToc.innerHTML = '';

    onlyActive = null;
    currentInlineCenter = null;
  };
};

const tocVisible = (): void => {
  elmToc.style.display = 'flex';

  elmToc.ariaHidden = null;
  elmToggle.ariaExpanded = 'true';

  scrollCenter();
};

const tocHide = (): void => {
  elmToc.style.display = 'none';

  elmToc.ariaHidden = 'true';
  elmToggle.ariaExpanded = 'false';
};

export const bootTableOfContents = (): void => {
  elmToc = document.getElementById('table-of-contents') as HTMLDivElement;
  elmToggle = document.getElementById('toc-toggle') as HTMLButtonElement;

  if (elmToc === null || elmToggle === null) {
    console.error('Table of contents not found');
    return;
  }

  tocReset();

  elmToggle.addEventListener(
    'click',
    () => {
      elmToc.checkVisibility() ? tocHide() : tocVisible();
    },
    { passive: true },
  );

  globalThis.matchMedia(`(min-width: ${BREAKPOINT_UI_WIDE}px)`).addEventListener('change', tocReset, { passive: true });
};
