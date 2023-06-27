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

  setTimeout(() => {
    document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(document.body).backgroundColor;
  }, 1);

  const html = document.querySelector('html');

  html.classList.remove(defaultTheme);
  html.classList.add(theme);
})();
