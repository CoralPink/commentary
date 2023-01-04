const html = document.querySelector('html');

// theme
(() => {
  let theme;
  try {
    theme = localStorage.getItem('mdbook-theme');

    if (theme.startsWith('"') && theme.endsWith('"')) {
      localStorage.setItem('mdbook-theme', theme.slice(1, theme.length - 1));
    }
  } catch (e) {}

  const defaultTheme = document.getElementById('start').dataset.defaulttheme;

  html.classList.remove(defaultTheme);
  html.classList.add(theme === null || theme === undefined ? defaultTheme : theme);
})();

// sidebar
(() => {
  try {
    const sidebar = localStorage.getItem('mdbook-sidebar');

    if (sidebar.startsWith('"') && sidebar.endsWith('"')) {
      localStorage.setItem('mdbook-sidebar', sidebar.slice(1, sidebar.length - 1));
    }
  } catch (e) {}

  const getSidebarStatus = () => {
    if (document.body.clientWidth < document.documentElement.style.getPropertyValue('--mobileMaxWidth')) {
      return 'hidden';
    }
    return localStorage.getItem('mdbook-sidebar') || 'visible';
  };
  html.classList.remove('sidebar-visible');
  html.classList.add('sidebar-' + getSidebarStatus());
})();

html.classList.remove('no-js');
html.classList.add('js');
