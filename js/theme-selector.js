import { writeLocalStorage } from './storage.js';

const THEME_COLORS = [
  { id: 'au-lait', label: 'Au Lait' },
  { id: 'latte', label: 'Latte' },
  { id: 'frappe', label: 'Frappé' },
  { id: 'macchiato', label: 'Macchiato' },
  { id: 'mocha', label: 'Mocha' },
];

const THEME_SELECTED = 'theme-selected';
const SAVE_STORAGE = 'mdbook-theme';

const setStyle = () => {
  document.querySelector('meta[name="theme-color"]').content = globalThis.getComputedStyle(
    document.body,
  ).backgroundColor;
};

const setTheme = next => {
  const current = document.querySelector('html').classList.value;

  if (next === current) {
    return;
  }

  document.querySelector('html').classList.replace(current, next);
  setStyle();

  const currentButton = document.getElementById(current);
  currentButton.classList.remove(THEME_SELECTED);
  currentButton.removeAttribute('aria-current');

  const nextButton = document.getElementById(next);
  nextButton.classList.add(THEME_SELECTED);
  nextButton.setAttribute('aria-current', 'true');

  writeLocalStorage(SAVE_STORAGE, next);
};

export const initTheme = () => {
  document.querySelector('html').classList.add(document.querySelector('html').classList.value);
  setStyle();
};

export const initThemeSelector = () => {
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
