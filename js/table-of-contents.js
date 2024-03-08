const ENABLE_PAGETOC = 760;

let tableOfContents;

class TableOfContents {
  #tocMap;
  #observer;

  #onlyActive = null;

  #addActive(entry) {
    if (this.#onlyActive !== null) {
      this.#onlyActive.classList.remove('active');
      this.#onlyActive = null;
    }
    this.#tocMap.get(entry.target).classList.add('active');
  }

  #removeActive(entry) {
    let count = 0;
    let active = null;

    for (const x of this.#tocMap.values()) {
      if (x.classList.contains('active')) {
        count++;
        active = x;
      }
    }

    if (count <= 1) {
      this.#onlyActive = active;
      return;
    }
    this.#tocMap.get(entry.target).classList.remove('active');
  }

  #initialize() {
    this.#observer = new IntersectionObserver(
      entries => {
        for (const x of entries) {
          x.isIntersecting ? this.#addActive(x) : this.#removeActive(x);
        }
      },
      {
        root: document.getElementById('content main'),
        threshold: 1.0,
      },
    );

    const pagetoc = document.getElementsByClassName('pagetoc')[0];
    pagetoc.innerHTML = '';

    for (const el of document.getElementById('main').querySelectorAll('a.header')) {
      this.#observer.observe(el);

      const link = document.createElement('a');

      link.appendChild(document.createTextNode(el.text));
      link.href = el.href;
      link.classList.add(el.parentElement.tagName);

      pagetoc.appendChild(link);
      this.#tocMap.set(el, link);
    }
  }

  reset() {
    this.#tocMap.clear();
    this.#observer.disconnect();

    this.#initialize();
  }

  constructor() {
    this.#tocMap = new Map();
    this.#initialize();
  }
}

export const initTableOfContents = () => {
  if (tableOfContents !== undefined) {
    tableOfContents.reset();
    return;
  }

  // If TableOfContents has not been created, create it.
  // Once created, it is not deleted even if the window size falls below `ENABLE_PAGETOC`.

  if (window.innerWidth >= ENABLE_PAGETOC) {
    tableOfContents = new TableOfContents();
    return;
  }

  matchMedia(`(min-width: ${ENABLE_PAGETOC}px)`).addEventListener(
    'change',
    ev => {
      if (ev.matches) {
        tableOfContents = new TableOfContents();
      }
    },
    { once: true, passive: true },
  );
};
