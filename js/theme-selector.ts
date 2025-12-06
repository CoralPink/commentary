import { ROOT_PATH } from './constants.ts';

import { getRootVariable, loadStyleSheet, unloadStyleSheet } from './utils/css-loader.ts';
import { readLocalStorage, writeLocalStorage } from './utils/storage.ts';

const THEME_DIRECTORY = 'css/catppuccin/';
const STYLE_THEMELIST = 'css/theme-list.css';

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

const prefersColor = matchMedia('(prefers-color-scheme: dark)');
const isDarkThemeRequired = (): boolean => prefersColor.matches;
const getFallbackColor = (): string => (isDarkThemeRequired() ? DARK_FALLBACK_COLOR : LIGHT_FALLBACK_COLOR);

const loadStyle = async (style: string): Promise<void> => {
  try {
    await loadStyleSheet(`${ROOT_PATH}${THEME_DIRECTORY}${style}.css`);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

    // Apply the same color as the background color ('--bg') to the title bar. (Effective in Safari only)
    // ...If you fail to get '--bg', fool it well!
    metaThemeColor.content = getRootVariable('--bg') || getFallbackColor();
  } catch (err) {
    console.warn(`Failed to load theme style '${style}':`, err);
  }
};

const setTheme = async (next: ThemeColorId): Promise<void> => {
  const html = document.querySelector('html');

  if (!html) {
    console.error('HTML element not found');
    return;
  }

  // Detect current theme safely among known IDs
  const current = themeColors.map(t => t.id).find(id => html.classList.contains(id));

  if (current === next) {
    return;
  }

  // Preload new stylesheet; finalize swap after it’s ready
  await loadStyle(next);

  if (current) {
    html.classList.replace(current, next);
  } else {
    html.classList.add(next);
  }

  // Refresh meta theme-color under the correct class
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;

  if (meta) {
    meta.content = getRootVariable('--bg') || getFallbackColor();
  }

  if (current) {
    unloadStyleSheet(`${ROOT_PATH}${THEME_DIRECTORY}${current}.css`);
  }

  // Skip UI updates if menu not initialized
  if (!document.getElementById(ID_THEME_LIST)) {
    return;
  }

  const currentButton = current ? document.getElementById(current) : null;
  const nextButton = document.getElementById(next);

  if (!currentButton) {
    console.error(`Current theme button id not found: ${current}`);
    return;
  }
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
  await loadStyleSheet(`${ROOT_PATH}${STYLE_THEMELIST}`);

  const themeList = document.createElement('ul');

  themeList.id = ID_THEME_LIST;
  themeList.setAttribute('aria-label', 'Theme selection menu');
  themeList.setAttribute('role', 'list');
  themeList.setAttribute('popover', '');

  const currentTheme = themeColors.map(t => t.id).find(id => document.documentElement.classList.contains(id)) ?? null;

  for (const theme of themeColors) {
    const li = document.createElement('li');

    li.setAttribute('role', 'menuitem');
    li.className = CLASS_THEME;
    li.id = theme.id;
    li.textContent = theme.label;

    if (currentTheme && li.id === currentTheme) {
      li.classList.add(THEME_SELECTED);
      li.setAttribute('aria-current', 'true');
    }

    themeList.appendChild(li);
  }

  themeList.addEventListener(
    'click',
    ev => {
      const target = ev.target;

      if (target instanceof Element) {
        const item = target.closest(`li.${CLASS_THEME}`);

        if (item) {
          setTheme(item.id as ThemeColorId);
        }
      }
    },
    { once: false, passive: true },
  );

  document.getElementById(LIST_APPEND_ID)?.appendChild(themeList);
  themeList.showPopover();
};

const changeEvent = (ev: MediaQueryListEvent): void => {
  const appearance = ev.matches ? KEY_DARK : KEY_LIGHT;
  const theme =
    readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ?? (ev.matches ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  setTheme(theme as ThemeColorId);
};

export const initThemeColor = (): void => {
  const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const theme =
    readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ??
    (isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  document.querySelector('html')?.classList.add(theme);
  loadStyle(theme);

  prefersColor.addEventListener('change', changeEvent, {
    once: false,
    passive: true,
  });

  for (const x of document.querySelectorAll(`[data-target="${TARGET_THEME_SELECTOR}"]`)) {
    x.addEventListener('click', initThemeSelector, {
      once: true,
      passive: true,
    });
  }
};
