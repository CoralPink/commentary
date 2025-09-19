import { getRootVariableNum, loadStyleSheet } from './css-loader.ts';
import { writeLocalStorage } from './storage.ts';

const PAGE_LIST = 'pagelist.html';
const STYLE_CHAPTER = 'css/chapter.css';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';

const TARGET_TOGGLE = 'sidebar';

const SAVE_STORAGE_KEY = 'mdbook-sidebar';
const SAVE_STATUS_VISIBLE = 'visible';
const SAVE_STATUS_HIDDEN = 'hidden';

let rootPath: string;
let uiBreak: number;

let searchPop: HTMLElement;

let isInitialized = false;

const getCurrentUrl = (): URL => {
  const current = document.location.href.toString();
  return new URL(current.endsWith('/') ? `${current}index.html` : current);
};

const loadSitemap = async (): Promise<string> => {
  const response = await fetch(`${rootPath}${PAGE_LIST}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${rootPath}${PAGE_LIST}: HTTP ${response.status}`);
  }
  return await response.text();
};

const initContent = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }
  isInitialized = true;

  const sidebar = document.getElementById(ID_SIDEBAR) as HTMLElement;
  sidebar.setAttribute('aria-busy', 'true');

  const rootUrl = new URL(rootPath, window.location.href);
  const currentUrl = getCurrentUrl();

  try {
    await loadStyleSheet(`${rootPath}${STYLE_CHAPTER}`);
    sidebar.insertAdjacentHTML('afterbegin', await loadSitemap());
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Failed to load pagelist - ${err.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    sidebar.insertAdjacentHTML('afterbegin', '<p>Error loading sidebar content.</p>');
    return;
  }

  const sidebarScrollbox = document.getElementById(ID_SCROLLBOX) as HTMLElement;
  const isAnchorElement = (element: Element): element is HTMLAnchorElement => element instanceof HTMLAnchorElement;

  for (const link of Array.from(sidebarScrollbox.querySelectorAll('a')).filter(isAnchorElement)) {
    const href = link.getAttribute('href');

    if (href === null) {
      console.error('No href attribute found for link:', link);
      continue;
    }

    const linkUrl = new URL(href, rootUrl);

    if (linkUrl.pathname === currentUrl.pathname) {
      link.classList.add('active');
      link.scrollIntoView({ block: 'center' });
      link.setAttribute('aria-current', 'page');
    }
    link.href = linkUrl.href;
  }
  sidebar.setAttribute('aria-busy', 'false');
};

const hideSidebar = (write = true): void => {
  document.getElementById(ID_PAGE)?.classList.remove('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR) as HTMLElement;
  sidebar.style.display = 'none';
  sidebar.setAttribute('aria-hidden', 'true');

  for (const x of document.querySelectorAll(`[data-target="${TARGET_TOGGLE}"]`)) {
    x.setAttribute('aria-expanded', 'false');
  }

  if (write) {
    writeLocalStorage(SAVE_STORAGE_KEY, SAVE_STATUS_HIDDEN);
  }
};

const clickHide = (ev: PointerEvent): void => {
  if (window.innerWidth >= uiBreak && ev.pointerType !== 'touch') {
    return;
  }

  hideSidebar();
  document.getElementById('main')?.removeEventListener('pointerdown', clickHide);
};

const showSidebar = (write = true): void => {
  initContent();

  document.getElementById(ID_PAGE)?.classList.add('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR) as HTMLElement;
  sidebar.style.display = 'block';
  sidebar.removeAttribute('aria-hidden');

  for (const x of document.querySelectorAll(`[data-target="${TARGET_TOGGLE}"]`)) {
    x.setAttribute('aria-expanded', 'true');
  }

  if (write) {
    writeLocalStorage(SAVE_STORAGE_KEY, SAVE_STATUS_VISIBLE);
  }

  setTimeout(() => {
    document.getElementById('main')?.addEventListener('pointerdown', clickHide, { once: false, passive: true });
  });
};

const toggleSidebar = (): void =>
  document.getElementById(ID_SIDEBAR)?.checkVisibility() ? hideSidebar() : showSidebar();

const toggleHandler = (key: string): void => {
  if (searchPop.checkVisibility()) {
    return;
  }

  if (key === 't' || key === 'T') {
    toggleSidebar();
  } else if (key === 'Escape') {
    hideSidebar();
  }
};

export const initSidebar = (root: string): void => {
  rootPath = root;

  try {
    uiBreak = getRootVariableNum('--breakpoint-ui-wide');

    if (window.innerWidth < uiBreak) {
      hideSidebar();
    } else {
      localStorage.getItem(SAVE_STORAGE_KEY) === SAVE_STATUS_HIDDEN ? hideSidebar(false) : showSidebar(false);
    }
  } catch (err: unknown) {
    console.error(`Failed to load "breakpoint-ui-wide": ${err}`);
    hideSidebar();
  }

  searchPop = document.getElementById('search-pop') as HTMLElement;

  document.addEventListener('keyup', ev => toggleHandler(ev.key), { once: false, passive: true });

  for (const x of document.querySelectorAll(`[data-target="${TARGET_TOGGLE}"]`)) {
    x.addEventListener('click', () => toggleSidebar(), { once: false, passive: true });
  }

  window.matchMedia(`(min-width: ${SHOW_SIDEBAR_WIDTH}px)`).addEventListener(
    'change',
    event => {
      if (event.matches) {
        showSidebar();
      }
    },
    { once: false, passive: true },
  );
};
