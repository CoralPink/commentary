'use strict';

// codeSnippets
(() => {
  Array.from(document.querySelectorAll('code'))
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

  Array.from(document.querySelectorAll('pre code')).forEach(block => {
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
})();

// themes
(() => {
  const themePopup = document.getElementById('theme-list');
  const themeToggleButton = document.getElementById('theme-toggle');

  const changeTheme = (theme) => {
    themePopup.querySelectorAll('.theme-selected')
      .forEach(el => el.classList.remove('theme-selected'));

    themePopup.querySelector('button#' + theme).classList.add('theme-selected');

    setTimeout(() => {
      document.querySelector('meta[name="theme-color"]').content = window.getComputedStyle(document.body).backgroundColor;
    }, 1);
  }

  const getTheme = () => {
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
  };

  let currentTheme = getTheme();

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

  themeToggleButton.addEventListener('click', () => {
    themePopup.style.display === 'block' ? hideThemes() : showThemes();
  }, { once: false, passive: true });

  themePopup.addEventListener('click', e => {
    if (e.target.className === 'theme') {
      setTheme(e.target.id);
    }
  }, { once: false, passive: true });

  themePopup.addEventListener('focusout', e => {
    // e.relatedTarget is null in Safari and Firefox on macOS (see workaround below)
    if (!!e.relatedTarget && !themeToggleButton.contains(e.relatedTarget) && !themePopup.contains(e.relatedTarget)) {
      hideThemes();
    }
  }, { once: false, passive: true });

  // Should not be needed, but it works around an issue on macOS & iOS: https://github.com/rust-lang/mdBook/issues/628
  document.addEventListener('click', e => {
    if (
      themePopup.style.display === 'block' &&
      !themeToggleButton.contains(e.target) &&
      !themePopup.contains(e.target)
    ) {
      hideThemes();
    }
  }, { once: false, passive: true });

  document.addEventListener('keydown', e => {
    if (themePopup.contains(e.target)) {
      e.preventDefault();
      hideThemes();
    }
  }, { once: false, passive: false });
})();

// sidebar
(() => {
  const html = document.querySelector('html');
  const sidebar = document.getElementById('sidebar');
  const sidebarLinks = document.querySelectorAll('#sidebar a');
  const sidebarToggleButton = document.getElementById('sidebar-toggle');

  // Apply ARIA attributes after the sidebar and the sidebar toggle button are added to the DOM
  sidebarToggleButton.setAttribute('aria-expanded', sidebar === 'visible');
  sidebar.setAttribute('aria-hidden', sidebar !== 'visible');

  sidebarLinks.forEach(link => {
    link.setAttribute('tabIndex', sidebar === 'visible' ? 0 : -1);
  });

  const toggleSection = ev => {
    ev.currentTarget.parentElement.classList.toggle('expanded');
  };

  Array.from(document.querySelectorAll('#sidebar a.toggle')).forEach(el => {
    el.addEventListener('click', toggleSection, { once: false, passive: true });
  });

  const showSidebar = () => {
    if (html.classList.contains('sidebar-visible')) {
      return;
    }

    html.classList.remove('sidebar-hidden');
    html.classList.add('sidebar-visible');

    Array.from(sidebarLinks).forEach(link => {
      link.setAttribute('tabIndex', 0);
    });

    sidebarToggleButton.setAttribute('aria-expanded', true);
    sidebar.setAttribute('aria-hidden', false);

    try {
      localStorage.setItem('mdbook-sidebar', 'visible');
    } catch (_e) {
      console.log('ERROR: showSidebar');
    }
  };

  const hideSidebar = () => {
    if (html.classList.contains('sidebar-hidden')) {
      return;
    }

    html.classList.remove('sidebar-visible');
    html.classList.add('sidebar-hidden');

    Array.from(sidebarLinks).forEach(link => {
      link.setAttribute('tabIndex', -1);
    });

    sidebarToggleButton.setAttribute('aria-expanded', false);
    sidebar.setAttribute('aria-hidden', true);

    try {
      localStorage.setItem('mdbook-sidebar', 'hidden');
    } catch (_e) {
      console.log('ERROR: hideSidebar');
    }
  };

  // Toggle sidebar
  sidebarToggleButton.addEventListener('click', () => {
    html.classList.contains('sidebar-hidden') ? showSidebar() : hideSidebar();
  }, { once: false, passive: true });

  let timeoutId = null;

  globalThis.addEventListener('resize', () => {
    clearTimeout(timeoutId);

    // FIXME: The definitions are all over the place.
    timeoutId = setTimeout(() => { if (window.innerWidth >= 1200) {
      showSidebar();
    }}, 200);
  }, { once: false, passive: true });

  let firstContact = null;

  document.addEventListener('touchstart', e => {
    firstContact = {
      x: e.touches[0].clientX,
      time: Date.now(),
    };
  }, { once: false, passive: true });

  document.addEventListener('touchmove', e => {
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
  }, { once: false, passive: true });

  // Scroll sidebar to current active section
  const activeSection = document.getElementById('sidebar').querySelector('.active');

  if (activeSection) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    activeSection.scrollIntoView({ block: 'center' });
  }

  // FIXME: The definitions are all over the place.
  if (window.innerWidth < 750) {
    hideSidebar();
  }
})();

// chapterNavigation
(() => {
  document.addEventListener('keyup', e => {
    if (window.search.hasFocus()) {
      return;
    }

    if (e.key == 'ArrowRight') {
      e.preventDefault();

      const nextButton = document.querySelector('.mobile-nav-chapters.next');

      if (nextButton) {
        window.location.href = nextButton.href;
      }
    }
    else if (e.key == 'ArrowLeft'){
      e.preventDefault();

      const previousButton = document.querySelector('.mobile-nav-chapters.previous');

      if (previousButton) {
        window.location.href = previousButton.href;
      }
    }
  }, { once: false, passive: false }
  );
})();

// clipboard
(() => {
  const hideTooltip = elem => {
    elem.firstChild.innerText = '';
    elem.className = 'fa-copy clip-button';
  };

  const showTooltip = (elem, msg) => {
    elem.firstChild.innerText = msg;
    elem.className = 'fa-copy tooltipped';
  };

  Array.from(document.querySelectorAll('.clip-button')).forEach(clipButton => {
    clipButton.addEventListener('mouseout', e => {
      hideTooltip(e.currentTarget);
    }, { once: false, passive: true });
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
})();
