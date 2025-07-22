import { writeLocalStorage } from './storage.ts';
import { getRootVariableNum, loadStyleSheet } from './css-loader.ts';

const PAGE_LIST = 'pagelist.html';
const STYLE_CHAPTER = 'css/chapter.css';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';
const ID_TOGGLE_BUTTON = 'sidebar-toggle';

const SAVE_STORAGE = 'mdbook-sidebar';

let rootPath: string;
let mobileMaxWidth: number;

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

  document.getElementById(ID_TOGGLE_BUTTON)?.setAttribute('aria-expanded', 'false');

  if (write) {
    writeLocalStorage(SAVE_STORAGE, 'hidden');
  }
};

const clickHide = (ev: PointerEvent): void => {
  if (window.innerWidth >= mobileMaxWidth && ev.pointerType !== 'touch') {
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

  document.getElementById(ID_TOGGLE_BUTTON)?.setAttribute('aria-expanded', 'true');

  if (write) {
    writeLocalStorage(SAVE_STORAGE, 'visible');
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
    mobileMaxWidth = getRootVariableNum('--breakpoint-ui-wide');

    if (window.innerWidth < mobileMaxWidth) {
      hideSidebar();
    } else {
      localStorage.getItem(SAVE_STORAGE) === 'hidden' ? hideSidebar(false) : showSidebar(false);
    }
  } catch (err: unknown) {
    console.error(`Failed to load "breakpoint-ui-wide": ${err}`);
    hideSidebar();
  }

  searchPop = document.getElementById('search-pop') as HTMLElement;

  document.addEventListener('keyup', ev => toggleHandler(ev.key), { once: false, passive: true });
  document
    .getElementById(ID_TOGGLE_BUTTON)
    ?.addEventListener('click', () => toggleSidebar(), { once: false, passive: true });

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
