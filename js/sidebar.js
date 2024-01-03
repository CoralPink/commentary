import { writeLocalStorage } from './storage.js';

const page = document.getElementById('page');
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('sidebar-toggle');

const active = sidebar.querySelector('.active');

const showSidebar = (write = true) => {
  page.style.display = 'grid';
  sidebar.style.display = 'block';
  sidebar.style.visibility = 'visible';
  sidebar.setAttribute('aria-hidden', false);
  toggleButton.setAttribute('aria-expanded', true);

  if (active) {
    active.scrollIntoView({ block: 'center' });
  }

  if (write) {
    writeLocalStorage('mdbook-sidebar', 'visible');
  }
};

const hideSidebar = (write = true) => {
  page.style.display = 'block';
  sidebar.style.display = 'none';
  sidebar.style.visibility = 'hidden';
  sidebar.setAttribute('aria-hidden', true);
  toggleButton.setAttribute('aria-expanded', false);

  if (write) {
    writeLocalStorage('mdbook-sidebar', 'hidden');
  }
};

const toggleSidebar = () => (toggleButton.getAttribute('aria-expanded') === 'true' ? hideSidebar() : showSidebar());

export const sidebarInit = () => {
  toggleButton.addEventListener('mousedown', () => toggleSidebar(), { once: false, passive: true });

  matchMedia('(min-width: 1200px)').addEventListener('change', event => {
    if (event.matches) {
      showSidebar();
    }
  });

  // FIXME: The definitions are all over the place.
  if (window.innerWidth < 750) {
    hideSidebar();
    return;
  }
  localStorage.getItem('mdbook-sidebar') === 'hidden' ? hideSidebar(false) : showSidebar(false);
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    document.addEventListener(
      'keyup',
      e => {
        if (globalThis.search.hasFocus()) {
          return;
        }

        if (e.key === 't' || e.key === 'T') {
          toggleSidebar();
        } else if (e.key === 'Escape') {
          hideSidebar();
        }
      },
      { once: false, passive: true },
    );
  }
);
