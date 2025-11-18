import { BREAKPOINT_UI_WIDE } from './constants.ts';
import { reverseItr } from './generators.ts';
import { readLocalStorage, writeLocalStorage } from './storage.ts';

const Environment = {
  WIDE: 0,
  COMPACT: 1,
} as const;

type Environment = (typeof Environment)[keyof typeof Environment];

const tocClass = ['righttoc', 'bottomtoc'] as const;

const SAVE_STORAGE_KEY = 'compact-menu';
const SAVE_STATUS_VISIBLE = 'visible';
const SAVE_STATUS_HIDDEN = 'hidden';

const tocMap: Map<HTMLElement, HTMLAnchorElement> = new Map();
let observer: IntersectionObserver | null = null;

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

const jumpHeader = (ev: MouseEvent, el: HTMLAnchorElement): void => {
  ev.preventDefault();

  const target = document.getElementById(decodeURIComponent(el.hash.slice(1)));

  if (!target) {
    return;
  }
  history.replaceState(null, '', `#${target.id}`);

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'smooth' });
  });
};

const tocReset = (): void => {
  environment = globalThis.innerWidth >= BREAKPOINT_UI_WIDE ? Environment.WIDE : Environment.COMPACT;

  elmToc.classList.remove(...tocClass);
  elmToc.classList.add(tocClass[environment]);

  if (environment === Environment.WIDE) {
    tocVisible();
    return;
  }

  const status = readLocalStorage(SAVE_STORAGE_KEY);
  status !== null && status === SAVE_STATUS_VISIBLE ? tocVisible() : tocHide();
};

const getHeaders = (): Array<HTMLAnchorElement> => {
  const article = document.getElementById('article');

  if (!article) {
    console.error('Article element not found');
    return [];
  }

  return Array.from(article.querySelectorAll('a.header'));
};

export const registryToc = (): void => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      for (const x of reverseItr(entries)) {
        x.isIntersecting ? addActive(x) : removeActive(x);
      }
      scrollCenter();
    },
    { threshold: 1.0 },
  );

  const nav = document.getElementById('pagetoc');

  if (!nav) {
    console.error('nav not found.');
    return;
  }

  nav.innerHTML = '';

  const fragment = document.createDocumentFragment();

  for (const el of getHeaders()) {
    observer.observe(el);

    const link: HTMLAnchorElement = document.createElement('a');
    link.textContent = el.text;
    link.href = el.href;
    link.classList.add(el.parentElement?.tagName ?? '');

    link.addEventListener('click', ev => jumpHeader(ev, el), {
      once: false,
      passive: false,
    });

    tocMap.set(el, link);
    fragment.appendChild(link);
  }

  tocReset();

  nav.appendChild(fragment);
};

const tocVisible = (): void => {
  elmToc.style.display = 'flex';

  elmToc.removeAttribute('aria-hidden');
  elmToggle.setAttribute('aria-expanded', 'true');

  scrollCenter();

  writeLocalStorage(SAVE_STORAGE_KEY, SAVE_STATUS_VISIBLE);
};

const tocHide = (): void => {
  elmToc.style.display = 'none';

  elmToc.setAttribute('aria-hidden', 'true');
  elmToggle.setAttribute('aria-expanded', 'false');

  writeLocalStorage(SAVE_STORAGE_KEY, SAVE_STATUS_HIDDEN);
};

export const initTableOfContents = (): void => {
  elmToc = document.getElementById('table-of-contents') as HTMLDivElement;
  elmToggle = document.getElementById('toc-toggle') as HTMLButtonElement;

  if (!elmToc || !elmToggle) {
    console.error('Table of contents not found');
    return;
  }

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
