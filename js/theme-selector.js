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

const htmlClassList = document.querySelector('html').classList;

const setStyle = () => {
  document.querySelector('meta[name="theme-color"]').content = globalThis.getComputedStyle(
    document.body,
  ).backgroundColor;
};

const setTheme = next => {
  const current = htmlClassList.value;

  if (next === current) {
    return;
  }

  htmlClassList.replace(current, next);
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
  document.querySelector('html').classList.add(htmlClassList.value);
  setStyle();
};

export const initThemeSelector = () => {
  const themeList = document.createElement('ul');

  themeList.id = 'theme-list';
  themeList.setAttribute('aria-label', 'Theme selection menu');
  themeList.setAttribute('role', 'menu');
  themeList.setAttribute('popover', '');

  const currentTheme = htmlClassList.value;

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
    }
  }
  document.getElementById('top-bar').appendChild(themeList);

  themeList.addEventListener(
    'mouseup',
    ev => {
      if (!ev.target.classList.contains('theme')) {
        return;
      }
      setTheme(ev.target.id);
    },
    { once: false, passive: true },
  );
};
