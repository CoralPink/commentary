import wasmInit, { attribute_external_links } from './wasm_book.js';

wasmInit().then(() => {
  attribute_external_links();
});

const writeLocalStorage = (keyName, keyValue) => {
  try {
    localStorage.setItem(keyName, keyValue);
  } catch (e) {
    console.log(`ERROR: ${keyName} ${keyValue}\n${e}`);
  }
};

// initialize sidebar.
(() => {
  const page = document.getElementById('page');
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.getElementById('sidebar-toggle');

  const active = sidebar.querySelector('.active');

  const showSidebar = (write = true) => {
    page.style.display = 'grid';
    sidebar.style.display = 'block';
    sidebar.style.visibility = 'visible';
    sidebar.setAttribute('aria-hidden', false);
    toggleButton.setAttribute('aria-expanded', true);

    if (active) {
      active.scrollIntoView({ block: 'center' });
    }

    if (write) {
      writeLocalStorage('mdbook-sidebar', 'visible');
    }
  };

  const hideSidebar = (write = true) => {
    page.style.display = 'block';
    sidebar.style.display = 'none';
    sidebar.style.visibility = 'hidden';
    sidebar.setAttribute('aria-hidden', true);
    toggleButton.setAttribute('aria-expanded', false);

    if (write) {
      writeLocalStorage('mdbook-sidebar', 'hidden');
    }
  };

  const toggleSidebar = () => (toggleButton.getAttribute('aria-expanded') === 'true' ? hideSidebar() : showSidebar());

  // Toggle sidebar
  toggleButton.addEventListener('mousedown', () => toggleSidebar(), { once: false, passive: true });

  document.addEventListener(
    'keyup',
    e => {
      if (window.search.hasFocus()) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === 'Escape') {
        hideSidebar();
      }
    },
    { once: false, passive: true },
  );

  matchMedia('(min-width: 1200px)').addEventListener('change', event => {
    if (event.matches) {
      showSidebar();
    }
  });

  // FIXME: The definitions are all over the place.
  if (window.innerWidth < 750) {
    hideSidebar();
    return;
  }

  localStorage.getItem('mdbook-sidebar') === 'hidden' ? hideSidebar(false) : showSidebar(false);
})();

const initCodeBlock = () => {
  // capture hover event in iOS
  if (window.ontouchstart !== undefined) {
    document.addEventListener('touchstart', () => {}, { once: false, passive: true });
  }

  const copyProc = trigger => {
    const elem = trigger.target;

    const hideTooltip = () => {
      elem.firstChild.innerText = '';
      elem.className = 'fa-copy clip-button';
    };

    const showTooltip = msg => {
      elem.firstChild.innerText = msg;
      elem.className = 'fa-copy tooltipped';

      setTimeout(hideTooltip, 1200);
    };

    navigator.clipboard.writeText(elem.closest('pre').querySelector('code').innerText).then(
      () => showTooltip('Copied!'),
      () => showTooltip('Failed...'),
    );
  };

  const clip = document.createElement('button');

  clip.className = 'fa-copy clip-button';
  clip.setAttribute('aria-label', 'Copy to clipboard');
  clip.innerHTML = '<i class="tooltiptext"></i>';

  for (const code of document.querySelector('.content main').querySelectorAll('pre code')) {
    if (code.classList.contains('language-txt')) {
      continue;
    }

    const worker = new Worker('/commentary/hl-worker.js');

    worker.onmessage = ev => {
      code.innerHTML = ev.data;
      worker.terminate();
    };

    worker.postMessage([code.textContent, code.classList[0]]);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';
    buttons.insertBefore(document.importNode(clip, true), buttons.firstChild);
    buttons.addEventListener('mousedown', copyProc);

    const parent = code.parentNode;
    parent.insertBefore(buttons, parent.firstChild);
  }
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
  };

  const removeActive = entry => {
    let count = 0;
    let active = null;

    for (const x of tocMap.values()) {
      if (x.classList.contains('active')) {
        count++;
        active = x;
      }
    }

    if (count <= 1) {
      onlyActive = active;
      return;
    }
    tocMap.get(entry.target).classList.remove('active');
  };

  const observer = new IntersectionObserver(
    entries => {
      for (const x of entries) {
        x.isIntersecting ? addActive(x) : removeActive(x);
      }
    },
    {
      root: document.getElementById('#content'),
    },
  );

  const pagetoc = document.getElementsByClassName('pagetoc')[0];

  for (const el of document.querySelectorAll('.content a.header')) {
    observer.observe(el);

    const link = document.createElement('a');

    link.appendChild(document.createTextNode(el.text));
    link.href = el.href;
    link.classList.add(el.parentElement.tagName);

    pagetoc.appendChild(link);
    tocMap.set(el, link);
  }
};

const initThemeSelector = () => {
  const themePopup = document.getElementById('theme-list');
  const themeToggleButton = document.getElementById('theme-toggle');

  let firstShow = true;

  const hideThemes = () => {
    themePopup.style.display = 'none';
    themeToggleButton.setAttribute('aria-expanded', false);
  };

  const showThemes = () => {
    themePopup.style.display = 'block';
    themeToggleButton.setAttribute('aria-expanded', true);

    // TODO: This funny code is because Firefox still won't let me use Popover (by default)!
    if (firstShow) {
      document.addEventListener(
        'mousedown',
        e => {
          if (
            themePopup.style.display === 'block' &&
            !themeToggleButton.contains(e.target) &&
            !themePopup.contains(e.target)
          ) {
            hideThemes();
          }
        },
        { once: false, passive: true },
      );
      firstShow = false;
    }
  };

  themeToggleButton.addEventListener(
    'mousedown',
    () => (themePopup.style.display === 'block' ? hideThemes() : showThemes()),
    { once: false, passive: true },
  );

  const setTheme = next => {
    const htmlClass = document.querySelector('html').classList;
    const current = htmlClass.value;

    if (next === current) {
      return;
    }

    htmlClass.replace(current, next);

    setTimeout(() => {
      document.getElementById(current).classList.remove('theme-selected');
      document.getElementById(next).classList.add('theme-selected');

      document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(
        document.body,
      ).backgroundColor;

      writeLocalStorage('mdbook-theme', next);
    }, 1);
  };

  themePopup.addEventListener('mousedown', e => setTheme(e.target.id), { once: false, passive: true });
};

const keyControl = () => {
  // chapterNavigation
  document.addEventListener(
    'keyup',
    e => {
      if (window.search.hasFocus()) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();

        const nextButton = document.querySelector('.content main .nav-chapters.next');

        if (nextButton) {
          window.location.href = nextButton.href;
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();

        const previousButton = document.querySelector('.content main .nav-chapters.previous');

        if (previousButton) {
          window.location.href = previousButton.href;
        }
      }
    },
    { once: false, passive: true },
  );
};

document.addEventListener(
  'DOMContentLoaded',
  () => {
    createTableOfContents();

    initCodeBlock();
    initThemeSelector();

    keyControl();
  },
  { once: true, passive: true },
);
