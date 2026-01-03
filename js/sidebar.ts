import { BREAKPOINT_UI_WIDE, CONTENT_READY, ROOT_PATH } from './constants.ts';

import { fetchText } from './utils/fetch.ts';

const PAGE_LIST = `${ROOT_PATH}pagelist.html`;

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';

const TARGET_TOGGLE = 'sidebar';

let doneFirstScroll = false;
let currentPage: HTMLAnchorElement | undefined = undefined;

const hideSidebar = (): void => {
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

  document.getElementById('main')?.removeEventListener('pointerdown', clickHide);
};

const clickHide = (ev: PointerEvent): void => {
  if (globalThis.innerWidth >= BREAKPOINT_UI_WIDE && ev.pointerType !== 'touch') {
    return;
  }

  hideSidebar();
};

const showSidebar = (): void => {
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

  setTimeout(() => {
    document.getElementById('main')?.addEventListener('pointerdown', clickHide, { once: false, passive: true });
  });

  if (doneFirstScroll) {
    return;
  }

  requestAnimationFrame(() => {
    currentPage?.scrollIntoView({ block: 'center' });
  });

  doneFirstScroll = true;
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

const loadPageList = async (): Promise<void> => {
  const sidebar = document.getElementById(ID_SIDEBAR);

  if (!sidebar) {
    console.error(`sidebar: not found ${ID_SIDEBAR}`);
    return;
  }

  sidebar.setAttribute('aria-busy', 'true');

  try {
    sidebar.insertAdjacentHTML('afterbegin', await fetchText(PAGE_LIST));
  } catch (err: unknown) {
    sidebar.insertAdjacentHTML('afterbegin', '<p>Error loading sidebar content.</p>');

    if (err instanceof Error) {
      console.error(`Failed to load pagelist - ${err.message}`);
    } else {
      console.error('An unknown error occurred');
    }
  } finally {
    sidebar.setAttribute('aria-busy', 'false');
  }
};

const getCurrentUrl = (): URL => {
  const s = document.location.href;
  return new URL(s.endsWith('/') ? `${s}index.html` : s);
};

const updateActive = (): void => {
  const scrollbox = document.getElementById(ID_SCROLLBOX);

  if (!scrollbox) {
    console.error(`sidebar: not found ${ID_SCROLLBOX}`);
    return;
  }
  doneFirstScroll = false;

  const targetPath = getCurrentUrl().pathname;

  currentPage = Array.from(scrollbox.querySelectorAll<HTMLAnchorElement>('a[href]')).find(
    x => x.pathname === targetPath,
  );

  if (currentPage === undefined) {
    return;
  }
  currentPage.classList.add('active');
  currentPage.setAttribute('aria-current', 'page');
};

export const removeActive = (): void => {
  if (currentPage === undefined) {
    return;
  }
  currentPage.classList.remove('active');
  currentPage.removeAttribute('aria-current');

  currentPage = undefined;
};

export const bootSidebar = async (): Promise<void> => {
  const promiseInit = loadPageList();

  globalThis.innerWidth < BREAKPOINT_UI_WIDE ? hideSidebar() : showSidebar();

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

  document.addEventListener(CONTENT_READY, updateActive, {
    once: false,
    passive: true,
  });

  await promiseInit;

  updateActive();
};
