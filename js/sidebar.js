import { writeLocalStorage } from './storage.js';
import { getRootVariableNum } from './css-variables.js';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_TOGGLE_BUTTON = 'sidebar-toggle';

const SAVE_STORAGE = 'mdbook-sidebar';

const showSidebar = (write = true) => {
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

export const initSidebar = () => {
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
