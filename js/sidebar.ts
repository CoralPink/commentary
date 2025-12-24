import { BREAKPOINT_UI_WIDE, ROOT_PATH } from './constants.ts';

import { fetchText } from './utils/fetch.ts';
import { readLocalStorage, writeLocalStorage } from './utils/storage.ts';

const PAGE_LIST = `${ROOT_PATH}pagelist.html`;

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';

const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';

const TARGET_TOGGLE = 'sidebar';

const SAVE_STORAGE_KEY = 'mdbook-sidebar';
const SAVE_STATUS_VISIBLE = 'visible';
const SAVE_STATUS_HIDDEN = 'hidden';

let currentSelect: HTMLAnchorElement | undefined;

const hideSidebar = (write = true): void => {
  document.getElementById(ID_PAGE)?.classList.remove('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR);

  if (!sidebar) {
    console.error(`sidebar: not found ${ID_SIDEBAR}`);
    return;
  }
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

  const sidebar = document.getElementById(ID_SIDEBAR);

  if (!sidebar) {
    console.error(`sidebar: not found ${ID_SIDEBAR}`);
    return;
  }
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
  // TODO: While the search popup is displayed, suppress sidebar processing. but it looks a bit tacky...
  const searchPop = document.getElementById('search-pop');

  if (searchPop && searchPop.checkVisibility()) {
    return;
  }

  if (key === 't' || key === 'T') {
    toggleSidebar();
  } else if (key === 'Escape') {
    hideSidebar();
  }
};

const getCurrentUrl = (): URL => {
  const s = document.location.href.toString();
  return new URL(s.endsWith('/') ? `${s}index.html` : s);
};

export const updateActive = (url: URL) => {
  const sidebarScrollbox = document.getElementById(ID_SCROLLBOX);

  if (!sidebarScrollbox) {
    console.error(`sidebar: not found ${ID_SCROLLBOX}`);
    return;
  }

  const target = Array.from(sidebarScrollbox.querySelectorAll<HTMLAnchorElement>('a[href]')).find(
    x => x.pathname === url.pathname,
  );

  if (!target) {
    return;
  }

  target.classList.add('active');
  target.setAttribute('aria-current', 'page');

  if (currentSelect) {
    currentSelect.classList.remove('active');
    currentSelect.removeAttribute('aria-current');
  }
  currentSelect = target;
};

const initContent = async (): Promise<void> => {
  const sidebar = document.getElementById(ID_SIDEBAR);

  if (!sidebar) {
    console.error(`sidebar: not found ${ID_SIDEBAR}`);
    return;
  }
  sidebar.setAttribute('aria-busy', 'true');

  try {
    sidebar.insertAdjacentHTML('afterbegin', await fetchText(PAGE_LIST));
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Failed to load pagelist - ${err.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    sidebar.insertAdjacentHTML('afterbegin', '<p>Error loading sidebar content.</p>');
    return;
  } finally {
    sidebar.setAttribute('aria-busy', 'false');
  }
};

export const bootSidebar = (): void => {
  const promiseInit = initContent();

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

  document.addEventListener('keyup', ev => toggleHandler(ev.key), {
    once: false,
    passive: true,
  });

  globalThis.matchMedia(`(min-width: ${SHOW_SIDEBAR_WIDTH}px)`).addEventListener(
    'change',
    event => {
      if (event.matches) {
        showSidebar();
      }
    },
    { once: false, passive: true },
  );

  for (const x of document.querySelectorAll(`[data-target="${TARGET_TOGGLE}"]`)) {
    x.addEventListener('click', () => toggleSidebar(), {
      once: false,
      passive: true,
    });
  }

  requestAnimationFrame(async (): Promise<void> => {
    await promiseInit;

    updateActive(getCurrentUrl());

    if (currentSelect !== undefined) {
      currentSelect.scrollIntoView({ block: 'center' });
    }
  });
};
