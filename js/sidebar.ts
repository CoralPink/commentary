import { BREAKPOINT_UI_WIDE, ROOT_PATH } from './constants.ts';
import { navigateTo } from './navigate.ts';
import { readLocalStorage, writeLocalStorage } from './storage.ts';

const PAGE_LIST = `${ROOT_PATH}pagelist.html`;

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';

const TARGET_TOGGLE = 'sidebar';

const SAVE_STORAGE_KEY = 'mdbook-sidebar';
const SAVE_STATUS_VISIBLE = 'visible';
const SAVE_STATUS_HIDDEN = 'hidden';

let sidebarScrollbox: HTMLElement;
let currentSelect: HTMLAnchorElement | undefined;

// TODO: While the search popup is displayed, suppress sidebar processing. but it looks a bit tacky...
let searchPop: HTMLElement;

export const updateActive = (url: URL) => {
  const target = Array.from(sidebarScrollbox.querySelectorAll<HTMLAnchorElement>('a[href]')).find(
    x => x.pathname === url.pathname,
  );

  if (!target) {
    return;
  }

  target.classList.add('active');
  target.setAttribute('aria-current', 'page');

  requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'center' });
  });

  if (currentSelect) {
    currentSelect.classList.remove('active');
    currentSelect.removeAttribute('aria-current');
  }
  currentSelect = target;
};

const loadPageList = async (): Promise<string> => {
  const response = await fetch(PAGE_LIST);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${PAGE_LIST}: HTTP ${response.status}`);
  }
  return await response.text();
};

const initLink = (): void => {
  sidebarScrollbox = document.getElementById(ID_SCROLLBOX) as HTMLElement;

  for (const x of Array.from(sidebarScrollbox.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const href = x.getAttribute('href');

    if (!href) {
      console.error('No href attribute found for link:', x);
      continue;
    }

    const linkUrl = new URL(href, ROOT_PATH);
    x.href = linkUrl.href;

    x.addEventListener('click', ev => {
      ev.preventDefault();
      navigateTo(linkUrl);
    });
  }
};

const getCurrentUrl = (): URL => {
  const s = document.location.href.toString();
  return new URL(s.endsWith('/') ? `${s}index.html` : s);
};

const initContent = async (): Promise<void> => {
  const sidebar = document.getElementById(ID_SIDEBAR) as HTMLElement;
  sidebar.setAttribute('aria-busy', 'true');

  try {
    sidebar.insertAdjacentHTML('afterbegin', await loadPageList());
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Failed to load pagelist - ${err.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    sidebar.insertAdjacentHTML('afterbegin', '<p>Error loading sidebar content.</p>');
    return;
  }

  initLink();
  updateActive(getCurrentUrl());

  globalThis.addEventListener(
    'popstate',
    ev => {
      const path = ev.state?.path ?? location.pathname;
      navigateTo(new URL(path, location.origin), false);
    },
    { once: false, passive: true },
  );

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
  document.getElementById('main')?.removeEventListener('pointerdown', clickHide);
};

const clickHide = (ev: PointerEvent): void => {
  if (globalThis.innerWidth >= BREAKPOINT_UI_WIDE && ev.pointerType !== 'touch') {
    return;
  }

  hideSidebar();
};

const showSidebar = (write = true): void => {
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

export const initSidebar = (): void => {
  try {
    if (globalThis.innerWidth < BREAKPOINT_UI_WIDE) {
      hideSidebar();
    } else {
      readLocalStorage(SAVE_STORAGE_KEY) === SAVE_STATUS_HIDDEN ? hideSidebar(false) : showSidebar(false);
    }
  } catch (err: unknown) {
    console.error(`Sidebar initialization error: ${err}`);
    hideSidebar();
  }

  initContent();

  searchPop = document.getElementById('search-pop') as HTMLElement;

  document.addEventListener('keyup', ev => toggleHandler(ev.key), {
    once: false,
    passive: true,
  });

  for (const x of document.querySelectorAll(`[data-target="${TARGET_TOGGLE}"]`)) {
    x.addEventListener('click', () => toggleSidebar(), {
      once: false,
      passive: true,
    });
  }

  globalThis.matchMedia(`(min-width: ${SHOW_SIDEBAR_WIDTH}px)`).addEventListener(
    'change',
    event => {
      if (event.matches) {
        showSidebar();
      }
    },
    { once: false, passive: true },
  );
};
