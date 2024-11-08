import { writeLocalStorage } from './storage.js';
import { getRootVariableNum } from './css-variables.js';

const PAGE_LIST = 'pagelist.html';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';
const ID_TOGGLE_BUTTON = 'sidebar-toggle';

const SAVE_STORAGE = 'mdbook-sidebar';

let rootPath;
let isInitialize = false;

const getCurrentUrl = () => {
  const current = document.location.href.toString();
  return new URL(current.endsWith('/') ? `${current}index.html` : current);
};

const loadSitemap = async () => {
  const response = await fetch(`${rootPath}${PAGE_LIST}`);

  if (!response.ok) {
    throw new Error(`status: ${response.status})`);
  }
  return await response.text();
};

const initContent = async () => {
  if (isInitialize) {
    return;
  }
  isInitialize = true;

  const rootUrl = new URL(rootPath, window.location.href);
  const currentUrl = getCurrentUrl();

  try {
    document.getElementById(ID_SIDEBAR).insertAdjacentHTML('afterbegin', await loadSitemap());
  } catch (err) {
    console.error(`Failed to load pagelist - ${err.message}`);
    return;
  }

  const sidebarScrollbox = document.getElementById(ID_SCROLLBOX);

  for (const link of sidebarScrollbox.querySelectorAll('a')) {
    const linkUrl = new URL(link.getAttribute('href'), rootUrl);

    if (linkUrl.pathname === currentUrl.pathname) {
      link.classList.add('active');

      link.scrollIntoView({ block: 'center' });
      link.setAttribute('aria-current', 'page');
    }
    link.href = linkUrl.href;
  }
  sidebarScrollbox.setAttribute('aria-busy', 'false');
};

const showSidebar = (write = true) => {
  initContent();

  document.getElementById(ID_PAGE).classList.add('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR);
  sidebar.style.display = 'block';
  sidebar.removeAttribute('aria-hidden');

  document.getElementById(ID_TOGGLE_BUTTON).setAttribute('aria-expanded', true);

  if (write) {
    writeLocalStorage(SAVE_STORAGE, 'visible');
  }
};

const hideSidebar = (write = true) => {
  document.getElementById(ID_PAGE).classList.remove('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR);
  sidebar.style.display = 'none';
  sidebar.setAttribute('aria-hidden', true);

  document.getElementById(ID_TOGGLE_BUTTON).setAttribute('aria-expanded', false);

  if (write) {
    writeLocalStorage(SAVE_STORAGE, 'hidden');
  }
};

const toggleSidebar = () =>
  document.getElementById(ID_SIDEBAR).style.display === 'block' ? hideSidebar() : showSidebar();

const toggleHandler = ev => {
  if (globalThis.search.hasFocus()) {
    return;
  }

  if (ev.key === 't' || ev.key === 'T') {
    toggleSidebar();
  } else if (ev.key === 'Escape') {
    hideSidebar();
  }
};

export const initSidebar = root => {
  rootPath = root;

  const mobile_max_width = getRootVariableNum('--mobile-max-width');

  if (window.innerWidth < mobile_max_width) {
    hideSidebar();
  } else {
    localStorage.getItem(SAVE_STORAGE) === 'hidden' ? hideSidebar(false) : showSidebar(false);
  }

  document.addEventListener('keyup', toggleHandler, { once: false, passive: true });
  document
    .getElementById(ID_TOGGLE_BUTTON)
    .addEventListener('click', () => toggleSidebar(), { once: false, passive: true });

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
