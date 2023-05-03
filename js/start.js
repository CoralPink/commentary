// Set the theme.
(() => {
  const theme = localStorage.getItem('mdbook-theme');

  if (!theme) {
    document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(document.body).backgroundColor;
    return;
  }

  const defaultTheme = document.getElementById('start').dataset.defaulttheme;

  if (theme == defaultTheme) {
    return;
  }

  const html = document.querySelector('html');

  html.classList.remove(defaultTheme);
  html.classList.add(theme);
})();

// Sidebar automatically opens depending on display area.
(() => {
  const getSidebarState = () => {
    const sidebar = localStorage.getItem('mdbook-sidebar');

    if (sidebar) {
      return sidebar;
    }

    // FIXME: The definitions are all over the place.
    return document.body.clientWidth < 750 ? 'hidden' : 'visible';
  };

  const state = getSidebarState();

  if (state == `visible`) {
    return;
  }

  const html = document.querySelector('html');

  html.classList.remove('sidebar-visible');
  html.classList.add('sidebar-' + state);
})();

const attributeExternalLinks = () => {
  document
    .querySelector('.content')
    .querySelectorAll('a[href^=http]')
    .forEach(el => {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
};

const createTableOfContents = () => {
  const tocMap = new Map();
  let onlyActive = null;

  const addActive = entry => {
    if (onlyActive) {
      onlyActive.classList.remove('active');
      onlyActive = null;
    }
    tocMap.get(entry.target).classList.add('active');
  }

  const removeActive = entry => {
    let count = 0;
    let active = null;

    tocMap.forEach(key => { if (key.classList.contains('active')) {
      count++;
      active = key;
    }});

    if (count <= 1) {
      onlyActive = active;
      return;
    }
    tocMap.get(entry.target).classList.remove('active');
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(x => { x.isIntersecting ? addActive(x) : removeActive(x); })
  }, {
    root: document.querySelector('content'),
  });

  document
    .querySelector('.content')
    .querySelectorAll('a.header')
    .forEach(el => {
      observer.observe(el);

      const link = document.createElement('a');

      link.appendChild(document.createTextNode(el.text));
      link.href = el.href;
      link.classList.add(el.parentElement.tagName);

      document.getElementsByClassName('pagetoc')[0].appendChild(link);
      tocMap.set(el, link);
    });
};

// Open external link in a new tab.
document.addEventListener('DOMContentLoaded', () => {
  attributeExternalLinks();
  createTableOfContents();
}, { once: true, passive: true });
