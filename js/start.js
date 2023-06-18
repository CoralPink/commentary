// Set the theme.
(() => {
  const theme = localStorage.getItem('mdbook-theme');

  if (!theme) {
    document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(document.body).backgroundColor;
    return;
  }

  const defaultTheme = document.getElementById('start').dataset.defaulttheme;

  if (theme == defaultTheme) {
    return;
  }

  const html = document.querySelector('html');

  html.classList.remove(defaultTheme);
  html.classList.add(theme);
})();

// Sidebar automatically opens depending on display area.
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

  const html = document.querySelector('html');

  html.classList.remove('sidebar-visible');
  html.classList.add('sidebar-' + state);
})();
