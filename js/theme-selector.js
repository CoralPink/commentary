import { writeLocalStorage } from './storage.js';
import { getRootVariable } from './css-variables.js';

const CSS_DIRECTORY = 'css/theme';
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

const ID_THEME_SELECTOR = 'theme-selector';

let rootPath;

const unloadStyle = theme => {
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    if (link.href.endsWith(`${CSS_DIRECTORY}/${theme}.css`)) {
      link.parentNode.removeChild(link);
    }
  }
};

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
  });
};

const loadStyle = theme => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${rootPath}${CSS_DIRECTORY}/${theme}.css`;

  document.head.appendChild(link);
  setColorTitleBar();
};

const setTheme = next => {
  const current = document.querySelector('html').classList.value;

  if (next === current) {
    return;
  }

  document.querySelector('html').classList.replace(current, next);

  // Although it seems irregular, unloading takes place first.
  unloadStyle(current);
  loadStyle(next);

  const currentButton = document.getElementById(current);
  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  const nextButton = document.getElementById(next);
  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  writeLocalStorage(SAVE_STORAGE, next);
};

const initThemeSelector = () => {
  const themeList = document.createElement('ul');

  themeList.id = 'theme-list';
  themeList.setAttribute('aria-label', 'Theme selection menu');
  themeList.setAttribute('role', 'menu');
  themeList.setAttribute('popover', '');

  const currentTheme = document.documentElement.className;

  for (const theme of THEME_COLORS) {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    const button = document.createElement('button');
    button.setAttribute('role', 'menuitem');
    button.className = 'theme';
    button.id = theme.id;
    button.textContent = theme.label;

    li.appendChild(button);

    themeList.appendChild(li);

    if (button.id === currentTheme) {
      button.classList.add(THEME_SELECTED);
      button.setAttribute('aria-current', 'true');
    }
  }

  document.getElementById('top-bar').appendChild(themeList);

  themeList.addEventListener(
    'click',
    ev => {
      const button = ev.target.closest('button.theme');

      if (!button) {
        return;
      }
      setTheme(button.id);
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
  loadStyle(theme);

  document
    .getElementById(ID_THEME_SELECTOR)
    .addEventListener('click', initThemeSelector, { once: true, passive: true });
};
