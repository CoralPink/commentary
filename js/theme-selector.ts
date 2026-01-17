import { ROOT_PATH } from './constants.ts';

import { loadStyleSheet, unloadStyleSheet } from './utils/css-loader.ts';
import { readLocalStorage, writeLocalStorage } from './utils/storage.ts';
import { toast } from './utils/toast.ts';
import type { AbortableOptions } from './utils/type.ts';

const THEME_DIRECTORY = `${ROOT_PATH}css/catppuccin/`;
const THEME_STYLE = `${ROOT_PATH}css/theme-list.css`;

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
let styleAbortController: AbortController | null = null;

const prefersColor = matchMedia('(prefers-color-scheme: dark)');
const isDarkThemeRequired = (): boolean => prefersColor.matches;

const abortable = (signal?: AbortSignal): AbortableOptions => (signal ? { signal } : {});

const loadStyle = async (style: ThemeColorId, signal?: AbortSignal): Promise<void> => {
  const abortableOptions = abortable(signal);

  try {
    await loadStyleSheet(`${THEME_DIRECTORY}${style}.css`, abortableOptions);
  } catch (err) {
    if (signal?.aborted) {
      return;
    }

    console.error(`Failed to load ${style} theme`, err);
    toast.warning(`Failed to load "${style}" theme. Fallback applied.`);

    const fallback = isDarkThemeRequired() ? PREFERRED_DARK_THEME : DEFAULT_THEME;
    await loadStyleSheet(`${THEME_DIRECTORY}${fallback}.css`, abortableOptions);
  }
};

const setTheme = async (next: ThemeColorId): Promise<void> => {
  if (currentSelect === next) {
    return;
  }

  styleAbortController?.abort();
  styleAbortController = new AbortController();

  // Skip UI updates if menu not initialized
  if (!document.getElementById(ID_THEME_LIST)) {
    return;
  }

  const currentButton = document.getElementById(currentSelect);

  if (!currentButton) {
    console.error(`Current theme id not found: ${currentSelect}`);
    return;
  }

  const nextButton = document.getElementById(next);

  if (!nextButton) {
    console.error(`Next theme id not found: ${next}`);
    return;
  }

  const loadStylePromise = loadStyle(next, styleAbortController.signal).then(() => {
    unloadStyleSheet(`${THEME_DIRECTORY}${currentSelect}.css`);

    const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;
    writeLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`, next);

    currentSelect = next;
  });

  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  await loadStylePromise;
};

const initThemeSelector = async (): Promise<void> => {
  const promiseStyle = loadStyleSheet(THEME_STYLE);

  const append = document.getElementById(LIST_APPEND_ID);

  if (!append) {
    console.error(`not found: ${LIST_APPEND_ID}`);
    return;
  }

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

  append.appendChild(themeList);

  await promiseStyle;
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

  const loadStylePromise = loadStyle(theme as ThemeColorId).then(() => {
    currentSelect = theme as ThemeColorId;
  });

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
