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

  requestAnimationFrame(() => {
    currentInlineCenter?.scrollIntoView({ inline: 'center' });
  });
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
  target.setAttribute('aria-current', 'true');

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
  target.removeAttribute('aria-current');
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

  if (!header) {
    return;
  }

  ev.preventDefault();
  history.replaceState(null, '', `#${header.id}`);

  requestAnimationFrame(() => {
    header.scrollIntoView({ behavior: 'smooth' });
  });
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
    { threshold: 1.0 },
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
    fragment.appendChild(link);
  }

  const pageToc = document.getElementById('pagetoc') as HTMLDivElement;
  pageToc.appendChild(fragment);

  pageToc.addEventListener('click', jumpHeader, {
    once: false,
    passive: false,
  });

  return (): void => {
    tocReset();

    tocMap.clear();
    observer.disconnect();

    pageToc.removeEventListener('click', jumpHeader);
    pageToc.innerHTML = '';

    onlyActive = null;
    currentInlineCenter = null;
  };
};

const tocVisible = (): void => {
  elmToc.style.display = 'flex';

  elmToc.removeAttribute('aria-hidden');
  elmToggle.setAttribute('aria-expanded', 'true');

  scrollCenter();
};

const tocHide = (): void => {
  elmToc.style.display = 'none';

  elmToc.setAttribute('aria-hidden', 'true');
  elmToggle.setAttribute('aria-expanded', 'false');
};

export const bootTableOfContents = (): void => {
  elmToc = document.getElementById('table-of-contents') as HTMLDivElement;
  elmToggle = document.getElementById('toc-toggle') as HTMLButtonElement;

  if (!elmToc || !elmToggle) {
    console.error('Table of contents not found');
    return;
  }

  tocReset();

  elmToggle.addEventListener(
    'click',
    () => {
      elmToc.checkVisibility() ? tocHide() : tocVisible();
    },
    { once: false, passive: true },
  );

  globalThis
    .matchMedia(`(min-width: ${BREAKPOINT_UI_WIDE}px)`)
    .addEventListener('change', tocReset, { once: false, passive: true });
};
