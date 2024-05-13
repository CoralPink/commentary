import { writeLocalStorage } from './storage.js';

const SAVE_STORAGE = 'mdbook-theme';

const THEME_LIST = 'theme-list';
const THEME_SELECTED = 'theme-selected';

const htmlClassList = document.querySelector('html').classList;

const setStyle = () => {
  document.querySelector('meta[name="theme-color"]').content = globalThis.getComputedStyle(
    document.body,
  ).backgroundColor;
};

const setTheme = next => {
  const current = htmlClassList.value;

  if (next === current) {
    return;
  }

  htmlClassList.replace(current, next);
  setStyle();

  document.getElementById(current).classList.remove(THEME_SELECTED);
  document.getElementById(next).classList.add(THEME_SELECTED);

  writeLocalStorage(SAVE_STORAGE, next);
};

export const initTheme = () => {
  document.querySelector('html').classList.add(htmlClassList.value);
  setStyle();
};

export const initThemeSelector = () => {
  document.getElementById(htmlClassList.value).classList.add(THEME_SELECTED);

  document.getElementById(THEME_LIST).addEventListener(
    'mouseup',
    ev => {
      if (!ev.target.classList.contains('theme')) {
        return;
      }
      setTheme(ev.target.id);
    },
    { once: false, passive: true },
  );
};
