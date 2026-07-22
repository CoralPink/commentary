import { BREAKPOINT_UI_WIDE, CONTENT_READY } from './constants.ts';
import pagelist from './pagelist.ts';
import { isSearchPopoverOpen } from './searcher.ts';

import toast from './utils/toast.ts';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';

const TARGET_SIDEBAR_BUTTON = 'sidebar-btn';

let sidebarButton: HTMLButtonElement;

let doneFirstScroll = false;

let currentPage: HTMLAnchorElement | undefined = undefined;
let abortController: AbortController | undefined = undefined;

const hideSidebar = (): void => {
  document.getElementById(ID_PAGE)?.classList.remove('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR);

  if (sidebar === null) {
    console.error(`sidebar: not found ${ID_SIDEBAR}`);
    return;
  }
  sidebar.style.display = 'none';
  sidebar.ariaHidden = 'true';

  sidebarButton.ariaExpanded = 'false';

  abortController?.abort();
};

const getCurrentUrl = (): URL => {
  const s = document.location.href;
  return new URL(s.endsWith('/') ? `${s}index.html` : s);
};

const updateActive = (): void => {
  const scrollbox = document.getElementById(ID_SCROLLBOX);

  if (scrollbox === null) {
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
  currentPage.ariaCurrent = 'page';
};

const showSidebar = async (): Promise<void> => {
  const sidebar = document.getElementById(ID_SIDEBAR);

  if (sidebar === null) {
    console.error(`sidebar: not found ${ID_SIDEBAR}`);
    return;
  }

  const promiseLoad = pagelist.load(sidebar);

  document.getElementById(ID_PAGE)?.classList.add('show-sidebar');

  sidebar.style.display = 'block';
  sidebar.ariaHidden = null;

  sidebarButton.ariaExpanded = 'true';

  const controller = new AbortController();
  abortController = controller;

  document.getElementById('main')?.addEventListener(
    'pointerdown',
    () => {
      if (globalThis.innerWidth >= BREAKPOINT_UI_WIDE) {
        return;
      }
      hideSidebar();
    },
    { passive: true, signal: controller.signal },
  );

  if (doneFirstScroll) {
    return;
  }
  doneFirstScroll = true;

  await promiseLoad;

  updateActive();
  currentPage?.scrollIntoView({ block: 'center' });
};

const toggleSidebar = (): void => {
  document.getElementById(ID_SIDEBAR)?.checkVisibility() ? hideSidebar() : showSidebar();
};

const toggleHandler = (key: string): void => {
  if (isSearchPopoverOpen()) {
    return;
  }

  if (key === 't' || key === 'T') {
    toggleSidebar();
  } else if (key === 'Escape') {
    hideSidebar();
  }
};

const clearActive = (): void => {
  if (currentPage === undefined) {
    return;
  }
  currentPage.classList.remove('active');
  currentPage.ariaCurrent = null;

  currentPage = undefined;
};

export const bootSidebar = (): void => {
  const button = document.getElementById(TARGET_SIDEBAR_BUTTON);

  if (!(button instanceof HTMLButtonElement)) {
    toast.error('Sidebar is currently unavailable.');
    return;
  }
  sidebarButton = button;

  globalThis.innerWidth < BREAKPOINT_UI_WIDE ? hideSidebar() : showSidebar();

  document.addEventListener('keyup', ev => toggleHandler(ev.key), {
    passive: true,
  });

  globalThis.matchMedia(`(min-width: ${SHOW_SIDEBAR_WIDTH}px)`).addEventListener(
    'change',
    event => {
      if (event.matches) {
        showSidebar();
      }
    },
    { passive: true },
  );

  sidebarButton.addEventListener('click', toggleSidebar, {
    passive: true,
  });

  document.addEventListener(CONTENT_READY, clearActive, {
    passive: true,
  });

  document.addEventListener(CONTENT_READY, updateActive, {
    passive: true,
  });
};
