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
type ApplyThemeResult = ThemeColorId | null;

const DEFAULT_LIGHT: ThemeColorId = themeColors[1].id;
const DEFAULT_DARK: ThemeColorId = themeColors[3].id;

const KEY_SAVE_STORAGE = 'mdbook-theme';
const KEY_DARK = ':dark';
const KEY_LIGHT = ':light';

const THEME_SELECTED = 'theme-selected';
const TARGET_THEME_SELECTOR = 'theme-selector';

const ID_PAGE = 'page';
const ID_THEME_LIST = 'theme-list';
const CLASS_THEME = 'theme';

let currentSelect: ThemeColorId | null = null;
let styleAbortController: AbortController | null = null;

const prefersColor = matchMedia('(prefers-color-scheme: dark)');
const isDarkThemeRequired = (): boolean => prefersColor.matches;

const abortable = (signal?: AbortSignal): AbortableOptions => (signal ? { signal } : {});

const applyTheme = async (next: ThemeColorId, signal?: AbortSignal): Promise<ApplyThemeResult> => {
  try {
    await loadStyleSheet(`${THEME_DIRECTORY}${next}.css`, abortable(signal));
  } catch (err: unknown) {
    if (signal?.aborted) {
      return null;
    }
    toast.warning(`Failed to load "${next}" theme. Fallback applied.`);
    throw err;
  }

  if (currentSelect !== null) {
    unloadStyleSheet(`${THEME_DIRECTORY}${currentSelect}.css`);
  }

  return next;
};

const syncThemeUI = (next: ThemeColorId): void => {
  if (document.getElementById(ID_THEME_LIST) === null) {
    return;
  }
  if (currentSelect === null) {
    return;
  }

  const currentButton = document.getElementById(currentSelect);

  if (currentButton === null) {
    console.error(`Current theme id not found: ${currentSelect}`);
    return;
  }

  const nextButton = document.getElementById(next);

  if (nextButton === null) {
    console.error(`Next theme id not found: ${next}`);
    return;
  }

  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');
};

const saveStorage = (applied: ThemeColorId): void => {
  const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;
  writeLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`, applied);
};

const update = (next: ThemeColorId): void => {
  syncThemeUI(next);
  saveStorage(next);

  currentSelect = next;
};

const selectItem = (ev: MouseEvent): void => {
  if (!(ev.target instanceof Element)) {
    return;
  }

  const item = ev.target.closest(`li.${CLASS_THEME}`);

  if (item == null || currentSelect === item.id) {
    return;
  }

  styleAbortController?.abort();
  styleAbortController = new AbortController();

  applyTheme(item.id as ThemeColorId, styleAbortController.signal).then((result: ApplyThemeResult) => {
    if (!result) {
      return;
    }
    update(result);
  }).catch((err: unknown) => {
    console.error('Theme selection failed:', err);
  });
};

const initThemeSelector = async (): Promise<void> => {
  const promiseStyle = loadStyleSheet(THEME_STYLE);

  const page = document.getElementById(ID_PAGE);

  if (page === null) {
    console.error(`not found: ${ID_PAGE}`);
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

  themeList.addEventListener('click', selectItem, {
    once: false,
    passive: true,
  });

  page.appendChild(themeList);

  await promiseStyle;
  themeList.showPopover();
};

const changeEvent = (ev: MediaQueryListEvent): void => {
  const appearance = ev.matches ? KEY_DARK : KEY_LIGHT;
  const theme = readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ?? (ev.matches ? DEFAULT_DARK : DEFAULT_LIGHT);

  styleAbortController?.abort();
  styleAbortController = new AbortController();

  applyTheme(theme as ThemeColorId, styleAbortController.signal).then((result: ApplyThemeResult) => {
    if (result === null) {
      return;
    }
    update(result);
  });
};

export const bootThemeColor = (): Promise<void> => {
  const isDarkTheme = isDarkThemeRequired();
  const appearance = isDarkTheme ? KEY_DARK : KEY_LIGHT;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const loadTheme =
    readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ?? (isDarkTheme ? DEFAULT_DARK : DEFAULT_LIGHT);

  const loadStylePromise = applyTheme(loadTheme as ThemeColorId)
    .then((result: ApplyThemeResult) => {
      currentSelect = result;
    })
    .catch(async (err: unknown) => {
      console.error(`Failed to load ${loadTheme}`, err);

      // If this fails, I'll just give up...!!
      await loadStyleSheet(`${THEME_DIRECTORY}${isDarkTheme ? DEFAULT_DARK : DEFAULT_LIGHT}.css`);
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
