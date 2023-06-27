'use strict';

const attributeExternalLinks = () => {
  document.querySelectorAll('.content main a[href^="http"]').forEach(el => {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
};

const initSideBar = () => {
  const page = document.getElementById('page');
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.getElementById('sidebar-toggle');

  const toggleSection = ev => {
    ev.currentTarget.parentElement.classList.toggle('expanded');
  };

  Array.from(sidebar.querySelectorAll('a.toggle')).forEach(el => {
    el.addEventListener('click', toggleSection, { once: false, passive: true });
  });

  const showSidebar = () => {
    page.style.display = 'grid';
    sidebar.style.display = 'block';
    sidebar.setAttribute('aria-hidden', false);
    toggleButton.setAttribute('aria-expanded', true);

    try {
      localStorage.setItem('mdbook-sidebar', 'visible');
    } catch (_e) {
      console.log('ERROR: showSidebar');
    }
  };

  const hideSidebar = () => {
    page.style.display = 'block';
    sidebar.style.display = 'none';
    sidebar.setAttribute('aria-hidden', true);
    toggleButton.setAttribute('aria-expanded', false);

    try {
      localStorage.setItem('mdbook-sidebar', 'hidden');
    } catch (_e) {
      console.log('ERROR: hideSidebar');
    }
  };

  toggleButton.getAttribute('aria-expanded') == 'true' ? hideSidebar() : showSidebar();

  // Toggle sidebar
  toggleButton.addEventListener(
    'click',
    () => {
      toggleButton.getAttribute('aria-expanded') == 'true' ? hideSidebar() : showSidebar();
    },
    { once: false, passive: true }
  );

  // Scroll sidebar to current active section
  const activeSection = document.getElementById('sidebar').querySelector('.active');

  if (activeSection) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    activeSection.scrollIntoView({ block: 'center' });
  }

  let timeoutId = null;

  globalThis.addEventListener(
    'resize',
    () => {
      clearTimeout(timeoutId);

      // FIXME: The definitions are all over the place.
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1200) {
          showSidebar();
        }
      }, 200);
    },
    { once: false, passive: true }
  );

  // FIXME: The definitions are all over the place.
  if (window.innerWidth < 750) {
    hideSidebar();
    return;
  }

  const getSidebarState = () => {
    const sidebar = localStorage.getItem('mdbook-sidebar');

    if (sidebar) {
      return sidebar;
    }

    // FIXME: The definitions are all over the place.
    return document.body.clientWidth < 750 ? 'hidden' : 'visible';
  };
  getSidebarState() == 'visible' ? showSidebar() : hideSidebar();
};

const initCodeBlock = () => {
  const main = document.querySelector('.content main');

  Array.from(main.querySelectorAll('code'))
    // Don't highlight `inline code` blocks in headers.
    .filter(node => !node.parentElement.classList.contains('header'))
    .forEach(block => block.classList.add('hljs'));

  // Syntax highlighting Configuration
  hljs.configure({
    languages: ['txt'],
  });
  hljs.highlightAll();

  if (!window.playground_copyable) {
    return;
  }

  Array.from(main.querySelectorAll('pre code')).forEach(block => {
    const pre_block = block.parentNode;

    let buttons = pre_block.querySelector('.buttons');

    if (!buttons) {
      buttons = document.createElement('div');
      buttons.className = 'buttons';
      pre_block.insertBefore(buttons, pre_block.firstChild);
    }

    const clipButton = document.createElement('button');
    clipButton.className = 'fa-copy clip-button';
    clipButton.title = 'Copy to clipboard';
    clipButton.setAttribute('aria-label', clipButton.title);
    clipButton.innerHTML = '<i class="tooltiptext"></i>';

    buttons.insertBefore(clipButton, buttons.firstChild);
  });

  const hideTooltip = elem => {
    elem.firstChild.innerText = '';
    elem.className = 'fa-copy clip-button';
  };

  const showTooltip = (elem, msg) => {
    elem.firstChild.innerText = msg;
    elem.className = 'fa-copy tooltipped';
  };

  Array.from(main.querySelectorAll('pre .clip-button')).forEach(clipButton => {
    clipButton.addEventListener(
      'mouseout',
      e => {
        hideTooltip(e.currentTarget);
      },
      { once: false, passive: true }
    );
  });

  const clipboardSnippets = new ClipboardJS('.clip-button', {
    text: trigger => {
      hideTooltip(trigger);
      return trigger.closest('pre').querySelector('code').innerText;
    },
  });

  clipboardSnippets.on('success', e => {
    e.clearSelection();
    showTooltip(e.trigger, 'Copied!');
  });

  clipboardSnippets.on('error', e => showTooltip(e.trigger, 'Clipboard error!'));
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

    tocMap.forEach(key => {
      if (key.classList.contains('active')) {
        count++;
        active = key;
      }
    });

    if (count <= 1) {
      onlyActive = active;
      return;
    }
    tocMap.get(entry.target).classList.remove('active');
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(x => {
        x.isIntersecting ? addActive(x) : removeActive(x);
      });
    },
    {
      root: document.querySelector('content'),
    }
  );

  document.querySelectorAll('.content a.header').forEach(el => {
    observer.observe(el);

    const link = document.createElement('a');

    link.appendChild(document.createTextNode(el.text));
    link.href = el.href;
    link.classList.add(el.parentElement.tagName);

    document.getElementsByClassName('pagetoc')[0].appendChild(link);
    tocMap.set(el, link);
  });
};

const initThemeSelector = () => {
  const themePopup = document.getElementById('theme-list');
  const themeToggleButton = document.getElementById('theme-toggle');

  const changeTheme = theme => {
    themePopup.querySelectorAll('.theme-selected').forEach(el => el.classList.remove('theme-selected'));
    themePopup.querySelector('button#' + theme).classList.add('theme-selected');

    setTimeout(() => {
      document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(
        document.body
      ).backgroundColor;
    }, 1);
  };

  let currentTheme = (() => {
    let theme;

    try {
      theme = localStorage.getItem('mdbook-theme');
    } catch (_e) {
      console.log('ERROR: getTheme#mdbook-theme');
    }

    if (theme != null) {
      return theme;
    }

    const defaultTheme = document.getElementById('book').dataset.defaulttheme;
    changeTheme(defaultTheme);

    return defaultTheme;
  })();

  const setTheme = theme => {
    if (theme == currentTheme) {
      return;
    }

    changeTheme(theme);

    const html = document.querySelector('html');
    html.classList.remove(currentTheme);
    html.classList.add(theme);

    try {
      localStorage.setItem('mdbook-theme', theme);
    } catch (_e) {
      console.log('ERROR: setTheme#mdbook-theme');
    }

    currentTheme = theme;
  };

  const hideThemes = () => {
    themePopup.style.display = 'none';
    themeToggleButton.setAttribute('aria-expanded', false);
    themeToggleButton.focus();
  };

  const showThemes = () => {
    themePopup.style.display = 'block';
    themeToggleButton.setAttribute('aria-expanded', true);
    themePopup.querySelector('button#' + currentTheme).focus();
  };

  themeToggleButton.addEventListener(
    'click',
    () => {
      themePopup.style.display === 'block' ? hideThemes() : showThemes();
    },
    { once: false, passive: true }
  );

  themePopup.addEventListener(
    'click',
    e => {
      if (e.target.className === 'theme') {
        setTheme(e.target.id);
      }
    },
    { once: false, passive: true }
  );

  themePopup.addEventListener(
    'focusout',
    e => {
      // e.relatedTarget is null in Safari and Firefox on macOS (see workaround below)
      if (!!e.relatedTarget && !themeToggleButton.contains(e.relatedTarget) && !themePopup.contains(e.relatedTarget)) {
        hideThemes();
      }
    },
    { once: false, passive: true }
  );

  // Should not be needed, but it works around an issue on macOS & iOS: https://github.com/rust-lang/mdBook/issues/628
  document.addEventListener(
    'click',
    e => {
      if (
        themePopup.style.display === 'block' &&
        !themeToggleButton.contains(e.target) &&
        !themePopup.contains(e.target)
      ) {
        hideThemes();
      }
    },
    { once: false, passive: true }
  );

  document.addEventListener(
    'keydown',
    e => {
      if (themePopup.contains(e.target)) {
        e.preventDefault();
        hideThemes();
      }
    },
    { once: false, passive: false }
  );
};

const touchControl = () => {
  let firstContact = null;

  document.addEventListener(
    'touchstart',
    e => {
      firstContact = {
        x: e.touches[0].clientX,
        time: Date.now(),
      };
    },
    { once: false, passive: true }
  );

  document.addEventListener(
    'touchmove',
    e => {
      if (!firstContact) {
        return;
      }

      if (Date.now() - firstContact.time > 250) {
        return;
      }
      const curX = e.touches[0].clientX;
      const xDiff = curX - firstContact.x;

      if (Math.abs(xDiff) >= 150) {
        if (xDiff >= 0) {
          if (firstContact.x < Math.min(document.body.clientWidth * 0.25, 300)) {
            showSidebar();
          }
        } else {
          if (curX < 300) {
            hideSidebar();
          }
        }
        firstContact = null;
      }
    },
    { once: false, passive: true }
  );
};

// chapterNavigation
document.addEventListener(
  'keyup',
  e => {
    if (window.search.hasFocus()) {
      return;
    }

    const main = document.querySelector('.content main');

    if (e.key == 'ArrowRight') {
      e.preventDefault();

      const nextButton = main.querySelector('.nav-chapters.next');

      if (nextButton) {
        window.location.href = nextButton.href;
      }
    } else if (e.key == 'ArrowLeft') {
      e.preventDefault();

      const previousButton = main.querySelector('.nav-chapters.previous');

      if (previousButton) {
        window.location.href = previousButton.href;
      }
    }
  },
  { once: false, passive: false }
);

document.addEventListener(
  'DOMContentLoaded',
  () => {
    attributeExternalLinks();
    initSideBar();
    initCodeBlock();
    createTableOfContents();
    initThemeSelector();
    touchControl();
  },
  { once: true, passive: true }
);
