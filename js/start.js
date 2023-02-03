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
  const getSidebarStatus = () => {
    // FIXME: The definitions are all over the place.
    const mobileMaxWidth = 750;

    const sidebar = localStorage.getItem('mdbook-sidebar');

    if (sidebar) {
      return sidebar;
    }
    return document.body.clientWidth < mobileMaxWidth ? 'hidden' : 'visible';
  };

  html.classList.remove('sidebar-visible');
  html.classList.add('sidebar-' + getSidebarStatus());
})();

html.classList.remove('no-js');
html.classList.add('js');
