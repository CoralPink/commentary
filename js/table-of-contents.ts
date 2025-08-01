import { getRootVariableNum } from './css-loader.ts';
import { reverseItr } from './generators.ts';

const Environment = {
  WIDE: 0,
  COMPACT: 1,
} as const;

type Environment = (typeof Environment)[keyof typeof Environment];

const tocClass = ['righttoc', 'bottomtoc'] as const;

const tocMap: Map<HTMLElement, HTMLAnchorElement> = new Map();
let observer: IntersectionObserver;

let uiBreak: number;

let environment: Environment;
let onlyActive: HTMLElement | null = null;

let currentInlineCenter: HTMLElement | null = null;

const scrollCenter = (): void => {
  if (environment === Environment.WIDE || currentInlineCenter === null) {
    return;
  }
  setTimeout(() => {
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

  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `#${target.id}`);
  }
};

const initialize = (): void => {
  observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      for (const x of reverseItr(entries)) {
        x.isIntersecting ? addActive(x) : removeActive(x);
      }
      scrollCenter();
    },
    { threshold: 1.0 },
  );

  environment = window.innerWidth >= uiBreak ? Environment.WIDE : Environment.COMPACT;

  const nav: HTMLElement = document.createElement('nav');
  nav.setAttribute('id', 'pagetoc');
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Table of Contents');

  const article = document.getElementById('article');

  if (!article) {
    console.error('Article element not found');
    return;
  }

  const headers = article.querySelectorAll('a.header');

  for (const x of Array.from(headers)) {
    const el = x as HTMLAnchorElement;

    if (!el.parentElement) {
      console.error('Header element has no parent');
      continue;
    }

    observer.observe(el);

    const link: HTMLAnchorElement = document.createElement('a');

    link.appendChild(document.createTextNode(el.text));
    link.href = el.href;
    link.classList.add(el.parentElement?.tagName ?? '');

    link.addEventListener('click', ev => jumpHeader(ev, el), { once: false, passive: false });

    nav.appendChild(link);
    tocMap.set(el, link);
  }

  const toc = document.getElementById('table-of-contents');

  if (toc === null) {
    console.error('Table-of-contents does not exist');
    return;
  }

  toc.classList.add(tocClass[environment]);
  toc.appendChild(nav);
};

const tocReset = (): void => {
  const toc = document.getElementById('table-of-contents');

  if (toc === null) {
    console.error('Table-of-contents does not exist');
    return;
  }

  const pagetoc = document.getElementById('pagetoc');

  if (pagetoc === null) {
    console.error('Pagetoc element not found');
    return;
  }

  toc.classList.remove(tocClass[environment]);
  toc.removeChild(pagetoc);

  tocMap.clear();
  observer.disconnect();

  initialize();
};

export const initTableOfContents = (): void => {
  try {
    uiBreak = getRootVariableNum('--breakpoint-ui-wide');
  } catch (err: unknown) {
    console.error(`Failed to load "breakpoint-ui-wide": ${err}`);
    uiBreak = 999;
  }

  initialize();

  window.matchMedia(`(min-width: ${uiBreak}px)`).addEventListener('change', tocReset, { once: false, passive: true });
};
