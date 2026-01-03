import { ROOT_PATH } from './constants.ts';

import { loadStyleSheet, unloadStyleSheet } from './utils/css-loader.ts';
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

const KEY_SAVE_STORAGE = 'mdbook-theme';
const KEY_DARK = ':dark';
const KEY_LIGHT = ':light';

const THEME_SELECTED = 'theme-selected';
const TARGET_THEME_SELECTOR = 'theme-selector';
const LIST_APPEND_ID = 'page';

const ID_THEME_LIST = 'theme-list';
const CLASS_THEME = 'theme';

let currentSelect: ThemeColorId = themeColors[1].id;

const prefersColor = matchMedia('(prefers-color-scheme: dark)');
const isDarkThemeRequired = (): boolean => prefersColor.matches;

const loadStyle = async (style: string): Promise<void> => {
  try {
    await loadStyleSheet(`${ROOT_PATH}${THEME_DIRECTORY}${style}.css`);
  } catch (err) {
    console.error(`Failed to load theme style '${style}':`, err);
  }
};

const setTheme = async (next: ThemeColorId): Promise<void> => {
  if (currentSelect === next) {
    return;
  }

  // Preload new stylesheet; finalize swap after it’s ready
  const loadStylePromise = loadStyle(next);

  // Skip UI updates if menu not initialized
  if (!document.getElementById(ID_THEME_LIST)) {
    return;
  }

  const currentButton = document.getElementById(currentSelect);
  const nextButton = document.getElementById(next);

  if (!currentButton) {
    console.error(`Current theme button id not found: ${currentSelect}`);
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

  await loadStylePromise;
  unloadStyleSheet(`${ROOT_PATH}${THEME_DIRECTORY}${currentSelect}.css`);

  currentSelect = next;
};

const initThemeSelector = async (): Promise<void> => {
  await loadStyleSheet(`${ROOT_PATH}${STYLE_THEMELIST}`);

  const themeList = document.createElement('ul');

  themeList.id = ID_THEME_LIST;
  themeList.setAttribute('aria-label', 'Theme selection menu');
  themeList.setAttribute('role', 'list');
  themeList.setAttribute('popover', '');

  for (const theme of themeColors) {
    const li = document.createElement('li');

    li.setAttribute('role', 'menuitem');
    li.className = CLASS_THEME;
    li.id = theme.id;
    li.textContent = theme.label;

    if (li.id === currentSelect) {
      li.classList.add(THEME_SELECTED);
      li.setAttribute('aria-current', 'true');
    }

    themeList.appendChild(li);
  }

  themeList.addEventListener(
    'click',
    ev => {
      if (!(ev.target instanceof Element)) {
        return;
      }
      const item = ev.target.closest(`li.${CLASS_THEME}`);

      if (!item) {
        return;
      }
      setTheme(item.id as ThemeColorId);
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

export const bootThemeColor = (): Promise<void> => {
  const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const theme =
    readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ??
    (isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME);

  const loadStylePromise = loadStyle(theme);

  currentSelect = theme as ThemeColorId;

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

  return loadStylePromise;
};
