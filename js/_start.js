// Set the theme.
(() => {
  let theme = localStorage.getItem('mdbook-theme');

  if (!theme) {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'macchiato' : 'au-lait';
  }
  document.querySelector('html').classList.add(theme);

  setTimeout(() => {
    document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(document.body).backgroundColor;
    document.getElementById(theme).classList.add('theme-selected');
  }, 1);
})();
