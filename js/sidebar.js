import { writeLocalStorage } from './storage.js';
import { getRootVariableNum } from './css-variables.js';

import { TABLE_OF_CONTENTS } from './sidebar-list.js';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_SCROLLBOX = 'sidebar-scrollbox';
const ID_TOGGLE_BUTTON = 'sidebar-toggle';

const SAVE_STORAGE = 'mdbook-sidebar';

let rootPath;
let isInitialize = false;

/*
 * TODO: Referring to the mdbook v0.4.41, we will first try to force them to incorporate it!!
 */
const getCurrentUrl = () => {
  const current = document.location.href.toString();
  return new URL(current.endsWith('/') ? `${current}index.html` : current);
};

const initContent = () => {
  if (isInitialize) {
    return;
  }
  isInitialize = true;

  const currentUrl = getCurrentUrl();

  const sidebarScrollbox = document.getElementById(ID_SCROLLBOX);
  sidebarScrollbox.innerHTML = TABLE_OF_CONTENTS;

  const rootUrl = new URL(rootPath, window.location.href);

  for (const link of sidebarScrollbox.querySelectorAll('a')) {
    const linkUrl = new URL(link.getAttribute('href'), rootUrl);

    if (linkUrl.pathname === currentUrl.pathname) {
      link.classList.add('active');
    }
    link.href = linkUrl.href;
  }
};

const showSidebar = (write = true) => {
  initContent();

  document.getElementById(ID_PAGE).classList.add('show-sidebar');

  const sidebar = document.getElementById(ID_SIDEBAR);
  sidebar.style.display = 'block';
  sidebar.removeAttribute('aria-hidden');

  document.getElementById(ID_TOGGLE_BUTTON).setAttribute('aria-expanded', true);

  const active = sidebar.querySelector('.active');

  if (active) {
    active.scrollIntoView({ block: 'center' });
    active.setAttribute('aria-current', 'page');
  }

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
