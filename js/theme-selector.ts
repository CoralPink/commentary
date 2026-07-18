import { ROOT_PATH } from './constants.ts';

import { isSearchPopoverOpen } from './searcher.ts';

import { loadStyleSheet, unloadStyleSheet } from './utils/css-loader.ts';
import { readLocalStorage, writeLocalStorage } from './utils/storage.ts';
import toast from './utils/toast.ts';
import type { AbortableOptions } from './utils/type.ts';

const THEME_DIRECTORY = `${ROOT_PATH}css/catppuccin/`;
const THEME_STYLE = `${ROOT_PATH}css/theme-list.css`;

type ThemeColor = {
  readonly value: string;
  readonly label: string;
};

const themeColors = [
  { value: 'au-lait', label: 'Au Lait' },
  { value: 'latte', label: 'Latte' },
  { value: 'frappe', label: 'Frappé' },
  { value: 'macchiato', label: 'Macchiato' },
  { value: 'mocha', label: 'Mocha' },
] as const satisfies readonly ThemeColor[];

type ThemeName = (typeof themeColors)[number]['value'];
type ApplyThemeResult = ThemeName | null;

const DEFAULT_LIGHT: ThemeName = 'latte';
const DEFAULT_DARK: ThemeName = 'macchiato';

const KEY_SAVE_STORAGE = 'mdbook-theme';
const KEY_DARK = ':dark';
const KEY_LIGHT = ':light';

const TARGET_THEME_BUTTON = 'theme-btn';

const ID_PAGE = 'page';
const ID_THEME_LIST = 'theme-list';
const CLASS_THEME = 'theme';

const abortInitTheme = new AbortController();

let currentSelect: ThemeName | null = null;
let styleAbortController: AbortController | null = null;

const prefersColor = matchMedia('(prefers-color-scheme: dark)');
const isDarkThemeRequired = (): boolean => prefersColor.matches;

const abortable = (signal?: AbortSignal): AbortableOptions => (signal ? { signal } : {});

const applyTheme = async (next: ThemeName, signal?: AbortSignal): Promise<ApplyThemeResult> => {
  try {
    await loadStyleSheet(`${THEME_DIRECTORY}${next}.css`, abortable(signal));
  } catch (err: unknown) {
    if (signal?.aborted) {
      return null;
    }
    toast.warn(`Failed to load "${next}" theme...`);
    throw err;
  }

  if (currentSelect !== null) {
    unloadStyleSheet(`${THEME_DIRECTORY}${currentSelect}.css`);
  }

  return next;
};

const saveStorage = (applied: ThemeName): void => {
  const appearance = isDarkThemeRequired() ? KEY_DARK : KEY_LIGHT;
  writeLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`, applied);
};

const update = (next: ThemeName): void => {
  saveStorage(next);

  currentSelect = next;
};

const selectItem = (ev: Event): void => {
  const item = ev.target;

  if (!(item instanceof HTMLInputElement)) {
    return;
  }

  if (currentSelect === item.value) {
    return;
  }

  styleAbortController?.abort();
  styleAbortController = new AbortController();

  applyTheme(item.value as ThemeName, styleAbortController.signal)
    .then((result: ApplyThemeResult) => {
      if (!result) {
        return;
      }
      update(result);
    })
    .catch((err: unknown) => {
      console.error('Theme selection failed:', err);
    });
};

const initThemeSelector = async (): Promise<void> => {
  const page = document.getElementById(ID_PAGE);

  if (page === null) {
    console.error(`not found: ${ID_PAGE}`);
    return;
  }

  const promiseStyle = loadStyleSheet(THEME_STYLE);
  const themeList = document.createElement('fieldset');

  themeList.id = ID_THEME_LIST;
  themeList.popover = 'auto';

  const legend = document.createElement('legend');
  legend.textContent = 'Theme selection';

  themeList.append(legend);

  for (const theme of themeColors) {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'radio';
    input.name = 'theme';
    input.value = theme.value;
    input.checked = theme.value === currentSelect;

    label.className = CLASS_THEME;
    label.append(input, theme.label);

    themeList.append(label);
  }

  themeList.addEventListener('change', selectItem, {
    passive: true,
  });

  page.append(themeList);

  try {
    await promiseStyle;
  } catch (err: unknown) {
    console.error('Failed to load theme selector styles:', err);
    toast.error('Theme selector styles failed to load.');
    return;
  }

  abortInitTheme.abort();

  const focusItem = (): void => {
    if (!themeList.matches(':popover-open')) {
      return;
    }

    const radio =
      themeList.querySelector<HTMLInputElement>('input[type="radio"]:checked') ??
      themeList.querySelector<HTMLInputElement>('input[type="radio"]');

    radio?.focus();
  };

  themeList.addEventListener('toggle', focusItem, { passive: true });

  document.addEventListener(
    'keyup',
    (ev: KeyboardEvent) => {
      switch (ev.key) {
        case 'c':
        case 'C':
          if (!isSearchPopoverOpen()) {
            themeList.togglePopover();
          }
          break;
      }
    },
    {
      passive: true,
    },
  );

  themeList.showPopover();
  requestAnimationFrame(focusItem);
};

const changeEvent = (ev: MediaQueryListEvent): void => {
  const storedTheme = readLocalStorage(`${KEY_SAVE_STORAGE}${ev.matches ? KEY_DARK : KEY_LIGHT}`);
  const theme = storedTheme ?? (ev.matches ? DEFAULT_DARK : DEFAULT_LIGHT);

  styleAbortController?.abort();
  styleAbortController = new AbortController();

  applyTheme(theme as ThemeName, styleAbortController.signal)
    .then((result: ApplyThemeResult) => {
      if (result === null) {
        return;
      }

      if (storedTheme !== null) {
        saveStorage(result);
      }
      currentSelect = result;
    })
    .catch((err: unknown) => {
      console.error('Theme change event failed:', err);
    });
};

export const bootThemeColor = (): Promise<void> => {
  const isDarkTheme = isDarkThemeRequired();
  const appearance = isDarkTheme ? KEY_DARK : KEY_LIGHT;

  // If the user has already specified a theme, that theme will be applied;
  // if not, it will be applied based on system requirements.
  const loadTheme =
    readLocalStorage(`${KEY_SAVE_STORAGE}${appearance}`) ?? (isDarkTheme ? DEFAULT_DARK : DEFAULT_LIGHT);

  const loadStylePromise = applyTheme(loadTheme as ThemeName)
    .then((result: ApplyThemeResult) => {
      currentSelect = result;
    })
    .catch(async (err: unknown) => {
      console.error(`Failed to load ${loadTheme}`, err);

      toast.error(`Failed to load ${loadTheme} color theme!`);
      toast.info('Attempting to apply the default theme...');

      try {
        const fallback = await applyTheme(isDarkTheme ? DEFAULT_DARK : DEFAULT_LIGHT);
        currentSelect = fallback;
      } catch (fallbackErr: unknown) {
        // If this fails, I'll just give up...!!
        console.error('Fallback theme also failed:', fallbackErr);
        toast.error('Unable to load any theme...');
      }
    });

  const button = document.getElementById(TARGET_THEME_BUTTON);

  if (button === null) {
    toast.error('Theme selection is currently unavailable.');
    return loadStylePromise;
  }

  prefersColor.addEventListener('change', changeEvent, {
    passive: true,
  });

  button.addEventListener('click', initThemeSelector, {
    passive: true,
    signal: abortInitTheme.signal,
  });

  document.addEventListener(
    'keyup',
    (ev: KeyboardEvent) => {
      switch (ev.key) {
        case 'c':
        case 'C':
          if (!isSearchPopoverOpen()) {
            initThemeSelector();
          }
          break;
      }
    },
    {
      passive: true,
      signal: abortInitTheme.signal,
    },
  );

  return loadStylePromise;
};
