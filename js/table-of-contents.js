export default class TableOfContents {
  #tocMap;
  #onlyActive;
  #observer;
  #pagetoc;

  #addActive(entry) {
    if (this.#onlyActive) {
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

  initialize() {
    this.#tocMap = new Map();
    this.#onlyActive = null;

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

    this.#pagetoc = document.getElementsByClassName('pagetoc')[0];
    this.#pagetoc.innerHTML = '';

    for (const el of document.getElementById('main').querySelectorAll('a.header')) {
      this.#observer.observe(el);

      const link = document.createElement('a');

      link.appendChild(document.createTextNode(el.text));
      link.href = el.href;
      link.classList.add(el.parentElement.tagName);

      this.#pagetoc.appendChild(link);
      this.#tocMap.set(el, link);
    }
  }
}
