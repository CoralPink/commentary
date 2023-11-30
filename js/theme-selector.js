import { writeLocalStorage } from './storage.js';

export default class ThemeSelector {
  #firstShow = true;
  #themePopup = document.getElementById('theme-list');
  #themeToggleButton = document.getElementById('theme-toggle');

  constructor() {
    this.#themeToggleButton.addEventListener(
      'mousedown',
      () => (this.#themePopup.style.display === 'block' ? this.hideThemes() : this.showThemes()),
      { once: false, passive: true },
    );

    this.#themePopup.addEventListener('mousedown', e => this.setTheme(e.target.id), { once: false, passive: true });
  }

  hideThemes() {
    this.#themePopup.style.display = 'none';
    this.#themeToggleButton.setAttribute('aria-expanded', false);
  }

  showThemes() {
    this.#themePopup.style.display = 'block';
    this.#themeToggleButton.setAttribute('aria-expanded', true);

    // TODO: This funny code is because Firefox still won't let me use Popover (by default)!
    if (this.#firstShow) {
      document.addEventListener(
        'mousedown',
        e => {
          if (
            this.#themePopup.style.display === 'block' &&
            !this.#themeToggleButton.contains(e.target) &&
            !this.#themePopup.contains(e.target)
          ) {
            this.hideThemes();
          }
        },
        { once: false, passive: true },
      );
      this.#firstShow = false;
    }
  }

  setTheme(next) {
    const htmlClass = document.querySelector('html').classList;
    const current = htmlClass.value;

    if (next === current) {
      return;
    }

    htmlClass.replace(current, next);

    setTimeout(() => {
      document.getElementById(current).classList.remove('theme-selected');
      document.getElementById(next).classList.add('theme-selected');

      document.querySelector('meta[name="theme-color"]').content = globalThis.getComputedStyle(
        document.body,
      ).backgroundColor;

      writeLocalStorage('mdbook-theme', next);
    }, 1);
  }
}
