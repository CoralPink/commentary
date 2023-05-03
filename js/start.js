const html = document.querySelector('html');

// theme
(() => {
  const theme = localStorage.getItem('mdbook-theme');

  if (!theme) {
    return;
  }

  const defaultTheme = document.getElementById('start').dataset.defaulttheme;

  if (theme == defaultTheme) {
    return;
  }
  html.classList.remove(defaultTheme);
  html.classList.add(theme);
})();

// sidebar
(() => {
  const getSidebarState = () => {
    const sidebar = localStorage.getItem('mdbook-sidebar');

    if (sidebar) {
      return sidebar;
    }

    // FIXME: The definitions are all over the place.
    return document.body.clientWidth < 750 ? 'hidden' : 'visible';
  };

  const state = getSidebarState();

  if (state == `visible`) {
    return;
  }
  html.classList.remove('sidebar-visible');
  html.classList.add('sidebar-' + state);
})();

// Open external link in a new tab.
document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelector('.content')
    .querySelectorAll('a[href^=http]')
    .forEach((el) => {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
}, { once: true, passive: true });
