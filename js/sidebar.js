import { writeLocalStorage } from './storage.js';

const SHOW_SIDEBAR_WIDTH = 1200;

const ID_PAGE = 'page';
const ID_SIDEBAR = 'sidebar';
const ID_TOGGLE_BUTTON = 'sidebar-toggle';

const showSidebar = (write = true) => {
  document.getElementById(ID_PAGE).style.display = 'grid';

  const sidebar = document.getElementById(ID_SIDEBAR);
  sidebar.style.display = 'block';
  sidebar.setAttribute('aria-hidden', false);

  document.getElementById(ID_TOGGLE_BUTTON).setAttribute('aria-expanded', true);

  const active = sidebar.querySelector('.active');

  if (active) {
    active.scrollIntoView({ block: 'center' });
  }

  if (write) {
    writeLocalStorage('mdbook-sidebar', 'visible');
  }
};

const hideSidebar = (write = true) => {
  document.getElementById(ID_PAGE).style.display = 'block';

  const sidebar = document.getElementById(ID_SIDEBAR);
  sidebar.style.display = 'none';
  sidebar.setAttribute('aria-hidden', true);

  document.getElementById(ID_TOGGLE_BUTTON).setAttribute('aria-expanded', false);

  if (write) {
    writeLocalStorage('mdbook-sidebar', 'hidden');
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
  // FIXME: The definitions are all over the place.
  if (window.innerWidth < 750) {
    hideSidebar();
  } else {
    localStorage.getItem('mdbook-sidebar') === 'hidden' ? hideSidebar(false) : showSidebar(false);
  }

  document.addEventListener('keyup', toggleHandler, { once: false, passive: true });
  document
    .getElementById(ID_TOGGLE_BUTTON)
    .addEventListener('mouseup', () => toggleSidebar(), { once: false, passive: true });

  matchMedia(`(min-width: ${SHOW_SIDEBAR_WIDTH}px)`).addEventListener(
    'change',
    event => {
      if (event.matches) {
        showSidebar();
      }
    },
    { once: false, passive: true },
  );
};
