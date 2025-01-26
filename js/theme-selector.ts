import { writeLocalStorage } from './storage';
import { getRootVariable, loadStyleSheet, unloadStyleSheet } from './css-loader';

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

const DARK_FALLBACK_COLOR = '#24273a';
const LIGHT_FALLBACK_COLOR = '#eff1f5';

const THEME_SELECTED = 'theme-selected';
const SAVE_STORAGE = 'mdbook-theme';

const ID_THEME_SELECTOR = 'theme-selector';

let rootPath: string;

const isDarkThemeRequired = () => matchMedia('(prefers-color-scheme: dark)').matches;

const loadStyle = async (style: string): Promise<void> => {
  try {
    await loadStyleSheet(`${rootPath}${THEME_DIRECTORY}${style}.css`);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

    metaThemeColor.content =
      getRootVariable('--bg') ?? (isDarkThemeRequired() ? DARK_FALLBACK_COLOR : LIGHT_FALLBACK_COLOR);
  } catch (err) {
    console.warn(`Failed to load theme style '${style}':`, err);
  }
};

const setTheme = (next: string): void => {
  const html = document.querySelector('html');

  if (!html) {
    console.error('HTML element not found');
    return;
  }

  const current = html.classList.value;

  if (next === current) {
    return;
  }
  loadStyle(next);
  unloadStyleSheet(`${rootPath}${THEME_DIRECTORY}${current}.css`);

  html.classList.replace(current, next);

  const currentButton = document.getElementById(current);
  const nextButton = document.getElementById(next);

  if (!currentButton || !nextButton) {
    console.error(`Theme button not found: ${!currentButton ? current : next}`);
    return;
  }

  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  writeLocalStorage(SAVE_STORAGE, next);
};

const initThemeSelector = async (): Promise<void> => {
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

  themeList.addEventListener(
    'click',
    ev => {
      const target = ev.target;

      if (target instanceof Element && target.matches('li.theme')) {
        setTheme(target.id);
      }
    },
    { once: false, passive: true },
  );

  document.getElementById('top-bar')?.appendChild(themeList);
  themeList.showPopover();
};

export const initThemeColor = (root: string): void => {
  rootPath = root;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const theme = localStorage.getItem('mdbook-theme') ?? (isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  loadStyle(theme);
  document.querySelector('html')?.classList.add(theme);

  const themeSelector = document.getElementById(ID_THEME_SELECTOR);

  if (themeSelector === null) {
    console.error(`ID:'${ID_THEME_SELECTOR}' not found`);
    return;
  }
  themeSelector.addEventListener('click', initThemeSelector, { once: true, passive: true });
};
