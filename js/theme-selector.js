import { writeLocalStorage } from './storage.js';

const THEME_LIST = 'theme-list';
const THEME_SELECTED = 'theme-selected';
const THEME_TOGGLE = 'theme-toggle';

const SAVE_STORAGE = 'mdbook-theme';

const selectHandler = ev => {
  if (document.getElementById(THEME_TOGGLE).contains(ev.target)) {
    return;
  }
  if (!document.getElementById(THEME_LIST).contains(ev.target)) {
    hideThemes();
    return;
  }
  setTheme(ev.target.id);
};

const hideThemes = () => {
  document.getElementById(THEME_LIST).style.display = 'none';
  document.getElementById(THEME_TOGGLE).setAttribute('aria-expanded', false);

  document.removeEventListener('mouseup', selectHandler, { once: false, passive: true });
};

const showThemes = () => {
  document.getElementById(THEME_LIST).style.display = 'block';
  document.getElementById(THEME_TOGGLE).setAttribute('aria-expanded', true);

  document.addEventListener('mouseup', selectHandler, { once: false, passive: true });
};

const setStyle = () => {
  document.querySelector('meta[name="theme-color"]').content = globalThis.getComputedStyle(
    document.body,
  ).backgroundColor;
};

const setTheme = next => {
  const htmlClass = document.querySelector('html').classList;
  const current = htmlClass.value;

  if (next === current) {
    return;
  }

  htmlClass.replace(current, next);
  setStyle();

  document.getElementById(current).classList.remove(THEME_SELECTED);
  document.getElementById(next).classList.add(THEME_SELECTED);

  writeLocalStorage(SAVE_STORAGE, next);
};

export const initThemeSelector = () => {
  const theme = document.querySelector('html').classList.value;

  document.querySelector('html').classList.add(theme);
  setStyle();

  document.getElementById(theme).classList.add(THEME_SELECTED);

  document
    .getElementById(THEME_TOGGLE)
    .addEventListener(
      'mouseup',
      () => (document.getElementById(THEME_LIST).style.display === 'block' ? hideThemes() : showThemes()),
      { once: false, passive: true },
    );
};
