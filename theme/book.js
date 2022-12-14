"use strict";

// Global variable, shared between modules
const playground_text = (playground) => {
  return playground.querySelector("code").innerText;
}

// codeSnippets
(() => {
  // Syntax highlighting Configuration
  hljs.configure({
    tabReplace: "    ", // 4 spaces
    languages: [], // Languages used for auto-detection
  });

  let code_nodes = Array.from(document.querySelectorAll("code"))
    // Don't highlight `inline code` blocks in headers.
    .filter((node) => {
      return !node.parentElement.classList.contains("header");
    });

  code_nodes.forEach((block) => {
    hljs.highlightBlock(block);
  });

  // Adding the hljs class gives code blocks the color css
  // even if highlighting doesn't apply
  code_nodes.forEach((block) => {
    block.classList.add("hljs");
  });

  if (window.playground_copyable) {
    Array.from(document.querySelectorAll("pre code")).forEach((block) => {
      const pre_block = block.parentNode;

      if (!pre_block.classList.contains("playground")) {
        let buttons = pre_block.querySelector(".buttons");

        if (!buttons) {
          buttons = document.createElement("div");
          buttons.className = "buttons";
          pre_block.insertBefore(buttons, pre_block.firstChild);
        }

        const clipButton = document.createElement("button");
        clipButton.className = "fa fa-copy clip-button";
        clipButton.title = "Copy to clipboard";
        clipButton.setAttribute("aria-label", clipButton.title);
        clipButton.innerHTML = '<i class="tooltiptext"></i>';

        buttons.insertBefore(clipButton, buttons.firstChild);
      }
    });
  }

  // Process playground code blocks
  Array.from(document.querySelectorAll(".playground")).forEach(() => {
    if (!window.playground_copyable) {
      return;
    }
    const copyCodeClipboardButton = document.createElement("button");

    copyCodeClipboardButton.className = "fa fa-copy clip-button";
    copyCodeClipboardButton.innerHTML = '<i class="tooltiptext"></i>';
    copyCodeClipboardButton.title = "Copy to clipboard";
    copyCodeClipboardButton.setAttribute("aria-label", copyCodeClipboardButton.title);

    buttons.insertBefore(copyCodeClipboardButton, buttons.firstChild);
  });
})();

// themes
(() => {
  const html = document.querySelector("html");
  const themeToggleButton = document.getElementById("theme-toggle");
  const themePopup = document.getElementById("theme-list");
  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

  const stylesheets = {
    highlight: document.querySelector("[href$='highlight.css']"),
  };

  const get_theme = () => {
    let theme;

    try {
      theme = localStorage.getItem("mdbook-theme");
    }
    catch (e) {
      console.log('ERROR: get_theme#mdbook-theme')
    }

    if (theme === null || theme === undefined) {
      return default_theme;
    }
    else {
      return theme;
    }
  }

  const updateThemeSelected = () => {
    themePopup.querySelectorAll(".theme-selected").forEach((el) => {
      el.classList.remove("theme-selected");
    });

    themePopup
      .querySelector("button#" + get_theme())
      .classList.add("theme-selected");
  }

  const set_theme = (theme, store = true) => {
    stylesheets.highlight.disabled = false;

    setTimeout(() => {
      themeColorMetaTag.content = getComputedStyle(
        document.body
      ).backgroundColor;
    }, 1);

    const previousTheme = get_theme();

    if (store) {
      try {
        localStorage.setItem("mdbook-theme", theme);
      }
      catch (e) {
        console.log('ERROR: set_theme#mdbook-theme')
      }
    }

    html.classList.remove(previousTheme);
    html.classList.add(theme);

    updateThemeSelected();
  }

  const hideThemes = () => {
    themePopup.style.display = "none";
    themeToggleButton.setAttribute("aria-expanded", false);
    themeToggleButton.focus();
  }

  const showThemes = () => {
    themePopup.style.display = "block";
    themeToggleButton.setAttribute("aria-expanded", true);
    themePopup.querySelector("button#" + get_theme()).focus();
  }

  // Set theme
  set_theme(get_theme(), false);

  themeToggleButton.addEventListener("click", () => {
    themePopup.style.display === "block" ? hideThemes() : showThemes();
  });

  themePopup.addEventListener("click", (e) => {
    let theme;

    if (e.target.className === "theme") {
      theme = e.target.id;
    }
    else if (e.target.parentElement.className === "theme") {
      theme = e.target.parentElement.id;
    }
    else {
      return;
    }
    set_theme(theme);
  });

  themePopup.addEventListener("focusout", (e) => {
    // e.relatedTarget is null in Safari and Firefox on macOS (see workaround below)
    if (
      !!e.relatedTarget &&
      !themeToggleButton.contains(e.relatedTarget) &&
      !themePopup.contains(e.relatedTarget)
    ) {
      hideThemes();
    }
  });

  // Should not be needed, but it works around an issue on macOS & iOS: https://github.com/rust-lang/mdBook/issues/628
  document.addEventListener("click", (e) => {
    if (
      themePopup.style.display === "block" &&
      !themeToggleButton.contains(e.target) &&
      !themePopup.contains(e.target)
    ) {
      hideThemes();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    if (!themePopup.contains(e.target)) {
      return;
    }

    if (e.key == "Escape") {
      e.preventDefault();
      hideThemes();
      return;
    }
    if (e.key == "ArrowUp") {
      e.preventDefault();
      const li = document.activeElement.parentElement;

      if (li && li.previousElementSibling) {
        li.previousElementSibling.querySelector("button").focus();
      }
      return;
    }
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const li = document.activeElement.parentElement;

      if (li && li.nextElementSibling) {
        li.nextElementSibling.querySelector("button").focus();
      }
      return;
    }
    if (e.key == "Home") {
      e.preventDefault();
      themePopup.querySelector("li:first-child button").focus();
      return;
    }
    if (e.key == "End") {
      e.preventDefault();
      themePopup.querySelector("li:last-child button").focus();
      return;
    }
  });
})();

// sidebar
(() => {
  const html = document.querySelector("html");
  const sidebar = document.getElementById("sidebar");
  const sidebarLinks = document.querySelectorAll("#sidebar a");
  const sidebarToggleButton = document.getElementById("sidebar-toggle");

  let firstContact = null;

  const showSidebar = () => {
    html.classList.remove("sidebar-hidden");
    html.classList.add("sidebar-visible");

    Array.from(sidebarLinks).forEach((link) => {
      link.setAttribute("tabIndex", 0);
    });

    sidebarToggleButton.setAttribute("aria-expanded", true);
    sidebar.setAttribute("aria-hidden", false);

    try {
      localStorage.setItem("mdbook-sidebar", "visible");
    }
    catch (e) {
      console.log('ERROR: mdbook-sidebar')
    }
  }

  const toggleSection = (ev) => {
    ev.currentTarget.parentElement.classList.toggle("expanded");
  }

  Array.from(document.querySelectorAll("#sidebar a.toggle")).forEach((el) => {
    el.addEventListener("click", toggleSection);
  });

  const hideSidebar = () => {
    html.classList.remove("sidebar-visible");
    html.classList.add("sidebar-hidden");

    Array.from(sidebarLinks).forEach((link) => {
      link.setAttribute("tabIndex", -1);
    });

    sidebarToggleButton.setAttribute("aria-expanded", false);
    sidebar.setAttribute("aria-hidden", true);

    try {
      localStorage.setItem("mdbook-sidebar", "hidden");
    }
    catch (e) {
      console.log('ERROR: mdbook-sidebar')
    }
  }

  // Toggle sidebar
  sidebarToggleButton.addEventListener("click", () => {
    if (html.classList.contains("sidebar-hidden")) {
      const current_width = parseInt(
        document.documentElement.style.getPropertyValue("--sidebar-width"),
        10
      );

      if (current_width < 150) {
        document.documentElement.style.setProperty("--sidebar-width", "150px");
      }
      showSidebar();
    }
    else if (html.classList.contains("sidebar-visible")) {
      hideSidebar();
    }
    else {
      getComputedStyle(sidebar)["transform"] === "none" ? hideSidebar() : showSidebar();
    }
  });

  window.addEventListener("resize", () => {
    window.innerWidth > 1100 ? showSidebar() : hideSidebar();
  });

  document.addEventListener("touchstart", (e) => {
    firstContact = {
      x: e.touches[0].clientX,
      time: Date.now(),
    };
  },
  { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!firstContact) return;

    const curX = e.touches[0].clientX;
    const xDiff = curX - firstContact.x;
    const tDiff = Date.now() - firstContact.time;

    if (tDiff < 250 && Math.abs(xDiff) >= 150) {
      if (xDiff >= 0) {
        if (firstContact.x < Math.min(document.body.clientWidth * 0.25, 300)) {
          showSidebar();
        }
      }
      else {
        if (curX < 300) {
          hideSidebar();
        }
      }
      firstContact = null;
    }
  },
  { passive: true });

  // Scroll sidebar to current active section
  let activeSection = document
    .getElementById("sidebar")
    .querySelector(".active");

  if (activeSection) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    activeSection.scrollIntoView({ block: "center" });
  }
})();

// chapterNavigation
(() => {
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    if (window.search && window.search.hasFocus()) {
      return;
    }

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();

        const nextButton = document.querySelector(".nav-chapters.next");

        if (nextButton) {
          window.location.href = nextButton.href;
        }
        break;

      case "ArrowLeft":
        e.preventDefault();

        const previousButton = document.querySelector(".nav-chapters.previous");

        if (previousButton) {
          window.location.href = previousButton.href;
        }
        break;
    }
  });
})();

// clipboard
(() => {
  const hideTooltip = (elem) => {
    elem.firstChild.innerText = "";
    elem.className = "fa fa-copy clip-button";
  }

  const showTooltip = (elem, msg) => {
    elem.firstChild.innerText = msg;
    elem.className = "fa fa-copy tooltipped";
  }

  const clipboardSnippets = new ClipboardJS(".clip-button", {
    text: (trigger) => {
      hideTooltip(trigger);
      return playground_text(trigger.closest("pre"));
    },
  });

  Array.from(document.querySelectorAll(".clip-button")).forEach((clipButton) => {
    clipButton.addEventListener("mouseout", (e) => {
      hideTooltip(e.currentTarget);
    });
  });

  clipboardSnippets.on("success", (e) => {
    e.clearSelection();
    showTooltip(e.trigger, "Copied!");
  });

  clipboardSnippets.on("error", (e) => {
    showTooltip(e.trigger, "Clipboard error!");
  });
})();

// scrollToTop
(() => {
  document.querySelector(".menu-title").addEventListener("click", () => {
    document.scrollingElement.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// controllMenu
(() => {
  const menu = document.getElementById("menu-bar");

  // controllPosition
  (() => {
    const scrollTop = document.scrollingElement.scrollTop;
    const prevScrollTop = scrollTop;

    // When the script loads, the page can be at any scroll (e.g. if you reforesh it).
    menu.style.top = scrollTop + "px";
    menu.classList.remove("sticky");

    document.addEventListener("scroll", () => {
      const scrollTopMax = Math.max(document.scrollingElement.scrollTop, 0);
      const menuPosAbsoluteY = menu.style.top.slice(0, -2) - scrollTopMax;

      let nextTop = null;
      let nextSticky = false;

      if (scrollTopMax > prevScrollTop) {
        if (menuPosAbsoluteY > 0) {
          nextTop = prevScrollTop;
        }
      }
      else {
        if (menuPosAbsoluteY > 0) {
          nextSticky = true;
        }
        else {
          const minMenuY = -menu.clientHeight - 50;

          if (menuPosAbsoluteY < minMenuY) {
            nextTop = prevScrollTop + minMenuY;
          }
        }
      }

      if (nextSticky === true) {
        menu.classList.add("sticky");
      }
      else {
        menu.classList.remove("sticky");
      }

      // `null` means that it doesn't need to be updated
      if (nextTop !== null) {
        menu.style.top = nextTop + "px";
      }
    },
    { passive: true });
  })();

  // controllBorder
  (() => {
    menu.classList.remove("bordered");
    document.addEventListener("scroll", () => {
      if (menu.offsetTop === 0) {
        menu.classList.remove("bordered");
      }
      else {
        menu.classList.add("bordered");
      }
    },
    { passive: true });
  })();
})();
