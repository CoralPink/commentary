import { getRootVariable, loadStyleSheet, unloadStyleSheet } from './css-loader.ts';
import { readLocalStorage, writeLocalStorage } from './storage.ts';

const STYLE_THEMELIST = 'css/theme-list.css';

const THEME_DIRECTORY = 'css/catppuccin/';

type ThemeColor = {
  readonly id: string;
  readonly label: string;
};

const themeColors = [
  { id: 'au-lait', label: 'Au Lait' },
  { id: 'latte', label: 'Latte' },
  { id: 'frappe', label: 'Frappé' },
  { id: 'macchiato', label: 'Macchiato' },
  { id: 'mocha', label: 'Mocha' },
] as const satisfies readonly ThemeColor[];

type ThemeColorId = (typeof themeColors)[number]['id'];

const DEFAULT_THEME: ThemeColorId = themeColors[1].id;
const PREFERRED_DARK_THEME: ThemeColorId = themeColors[3].id;

const DARK_FALLBACK_COLOR = '#24273a';
const LIGHT_FALLBACK_COLOR = '#eff1f5';

const KEY_SAVE_STORAGE = 'mdbook-theme';
const KEY_DARK = ':dark';
const KEY_LIGHT = ':light';

const THEME_SELECTED = 'theme-selected';
const TARGET_THEME_SELECTOR = 'theme-selector';
const LIST_APPEND_ID = 'page';

const ID_THEME_LIST = 'theme-list';
const CLASS_THEME = 'theme';

let rootPath: string;

const prefersColor = matchMedia('(prefers-color-scheme: dark)');
const isDarkThemeRequired = (): boolean => prefersColor.matches;

const loadStyle = async (style: string): Promise<void> => {
  try {
    await loadStyleSheet(`${rootPath}${THEME_DIRECTORY}${style}.css`);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

    // Apply the same color as the background color ('--bg') to the title bar. (Effective in Safari only)
    // ...If you fail to get '--bg', fool it well!
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

  // If initThemeSelector() has not been performed, subsequent processing is unnecessary.
  if (!document.getElementById(ID_THEME_LIST)) {
    return;
  }

  const currentButton = document.getElementById(current);

  if (!currentButton) {
    console.error(`Current theme button id not found: ${current}`);
    return;
  }

  const nextButton = document.getElementById(next);

  if (!nextButton) {
    console.error(`Next theme button id not found: ${next}`);
    return;
  }

  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;
  writeLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`, next);
};

const initThemeSelector = async (): Promise<void> => {
  await loadStyleSheet(`${rootPath}${STYLE_THEMELIST}`);

  const themeList = document.createElement('ul');

  themeList.id = ID_THEME_LIST;
  themeList.setAttribute('aria-label', 'Theme selection menu');
  themeList.setAttribute('role', 'menu');
  themeList.setAttribute('popover', '');

  const currentTheme = document.documentElement.className;

  for (const theme of themeColors) {
    const li = document.createElement('li');

    li.setAttribute('role', 'menuitem');
    li.className = CLASS_THEME;
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

      if (target instanceof Element && target.matches(`li.${CLASS_THEME}`)) {
        setTheme(target.id);
      }
    },
    { once: false, passive: true },
  );

  document.getElementById(LIST_APPEND_ID)?.appendChild(themeList);
  themeList.showPopover();
};

const changeEvent = (ev: MediaQueryListEvent): void => {
  const appearance = ev.matches ? KEY_DARK : KEY_LIGHT;
  const theme = readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ?? (isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  if (!theme) {
    return;
  }

  setTheme(theme);
}

export const initThemeColor = (root: string): void => {
  rootPath = root;

  const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const theme = readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ?? (isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  document.querySelector('html')?.classList.add(theme);
  loadStyle(theme);

  prefersColor.addEventListener('change', changeEvent);

  for (const x of document.querySelectorAll(`[data-target="${TARGET_THEME_SELECTOR}"]`)) {
    x.addEventListener('click', initThemeSelector, { once: true, passive: true });
  }
};
