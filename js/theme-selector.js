import { writeLocalStorage } from './storage.js';
import { getRootVariable, loadStyleSheet, unloadStyleSheet } from './css-loader.js';

const STYLE_THEMELIST = 'css/theme-list.css';

const THEME_DIRECTORY = 'css/catppuccin/';

const THEME_COLORS = [
  { id: 'au-lait', label: 'Au Lait' },
  { id: 'latte', label: 'Latte' },
  { id: 'frappe', label: 'Frappé' },
  { id: 'macchiato', label: 'Macchiato' },
  { id: 'mocha', label: 'Mocha' },
];

const DEFAULT_THEME = THEME_COLORS[1].id;
const PREFERRED_DARK_THEME = THEME_COLORS[3].id;

const CHANGE_TRANSITION = 'background-color 0.5s ease';

const THEME_SELECTED = 'theme-selected';
const SAVE_STORAGE = 'mdbook-theme';

const ID_THEME_SELECTOR = 'theme-selector';

let rootPath;

const isDarkThemeRequired = () => matchMedia('(prefers-color-scheme: dark)').matches;

const loadStyle = async style => {
  try {
    await loadStyleSheet(`${rootPath}${THEME_DIRECTORY}${style}.css`);

    // Apply the same color as the background color ('--bg') to the title bar. (Effective in Safari only)
    // ...If you fail to get '--bg', fool it well!
    document.querySelector('meta[name="theme-color"]').content =
      getRootVariable('--bg') ?? (isDarkThemeRequired() ? '#24273a' : '#eff1f5');
  } catch (err) {
    console.warn(`Failed to load theme style '${style}':`, err);
  }
};

const setTheme = next => {
  const current = document.querySelector('html').classList.value;

  if (next === current) {
    return;
  }

  loadStyle(next);
  unloadStyleSheet(`${rootPath}${THEME_DIRECTORY}${current}.css`);

  document.querySelector('html').classList.replace(current, next);

  const currentButton = document.getElementById(current);
  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  const nextButton = document.getElementById(next);
  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  writeLocalStorage(SAVE_STORAGE, next);
};

const initThemeSelector = async () => {
  await loadStyleSheet(`${rootPath}${STYLE_THEMELIST}`);

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
  document.body.style.transition = CHANGE_TRANSITION;

  themeList.addEventListener(
    'click',
    ev => {
      if (ev.target.matches('li.theme')) {
        setTheme(ev.target.id);
      }
    },
    { once: false, passive: true },
  );

  themeList.showPopover();
};

export const initThemeColor = root => {
  rootPath = root;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const theme = localStorage.getItem('mdbook-theme') ?? (isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  loadStyle(theme);
  document.querySelector('html').classList.add(theme);

  document
    .getElementById(ID_THEME_SELECTOR)
    .addEventListener('click', initThemeSelector, { once: true, passive: true });
};
