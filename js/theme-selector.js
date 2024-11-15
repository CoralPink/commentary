import { writeLocalStorage } from './storage.js';
import { getRootVariable, loadStyleSheet, unloadStyleSheet } from './css-loader.js';

const STYLE_THEMELIST = 'css/theme-list.css';

const THEME_DIRECTORY = 'css/theme';

const THEME_COLORS = [
  { id: 'au-lait', label: 'Au Lait' },
  { id: 'latte', label: 'Latte' },
  { id: 'frappe', label: 'Frappé' },
  { id: 'macchiato', label: 'Macchiato' },
  { id: 'mocha', label: 'Mocha' },
];

const DEFAULT_THEME = THEME_COLORS[1].id;
const PREFERRED_DARK_THEME = THEME_COLORS[3].id;

const THEME_SELECTED = 'theme-selected';
const SAVE_STORAGE = 'mdbook-theme';

const COLOR_TITLE_BAR_MAX_RETRY = 3;
const COLOR_TITLE_BAR_RETRY_DELAY_MS = 8;

const ID_THEME_SELECTOR = 'theme-selector';

let rootPath;

const setColorTitleBar = (retry = 0) => {
  const color = getRootVariable('--bg');

  if (color) {
    document.querySelector('meta[name="theme-color"]').content = color;
    return;
  }

  // You will not get the CSS variables if the timing is not right, so try several times repeatedly.
  // But if it still doesn't work, give up!

  if (retry >= COLOR_TITLE_BAR_MAX_RETRY) {
    console.warn('Failed to set theme color to title bar...');
    return;
  }

  setTimeout(() => {
    setColorTitleBar(retry + 1);
  }, COLOR_TITLE_BAR_RETRY_DELAY_MS);
};

const setTheme = next => {
  const current = document.querySelector('html').classList.value;

  if (next === current) {
    return;
  }

  // Although it seems irregular, unloading takes place first.
  unloadStyleSheet(`theme/${current}`);

  loadStyleSheet(`${rootPath}${THEME_DIRECTORY}/${next}.css`);
  document.querySelector('html').classList.replace(current, next);

  const currentButton = document.getElementById(current);
  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  const nextButton = document.getElementById(next);
  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  writeLocalStorage(SAVE_STORAGE, next);
};

const initThemeSelector = () => {
  loadStyleSheet(`${rootPath}${STYLE_THEMELIST}`);

  const themeList = document.createElement('ul');

  themeList.id = 'theme-list';
  themeList.setAttribute('aria-label', 'Theme selection menu');
  themeList.setAttribute('role', 'menu');
  themeList.setAttribute('popover', '');

  const currentTheme = document.documentElement.className;

  for (const theme of THEME_COLORS) {
    const li = document.createElement('li');

    li.setAttribute('role', 'menuitem');
    li.className = 'theme';
    li.id = theme.id;
    li.textContent = theme.label;

    if (li.id === currentTheme) {
      li.classList.add(THEME_SELECTED);
      li.setAttribute('aria-current', 'true');
    }

    themeList.appendChild(li);
  }

  document.getElementById('top-bar').appendChild(themeList);
  document.body.style.transition = 'background-color 0.5s ease';

  themeList.addEventListener(
    'click',
    ev => {
      const li = ev.target.closest('li.theme');

      if (li) {
        setTheme(li.id);
      }
    },
    { once: false, passive: true },
  );
};

export const initThemeColor = root => {
  rootPath = root;

  let theme = localStorage.getItem('mdbook-theme');

  if (!theme) {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? PREFERRED_DARK_THEME : DEFAULT_THEME;
  }
  document.querySelector('html').classList.add(theme);
  loadStyleSheet(`${rootPath}${THEME_DIRECTORY}/${theme}.css`);

  document
    .getElementById(ID_THEME_SELECTOR)
    .addEventListener('click', initThemeSelector, { once: true, passive: true });
};
