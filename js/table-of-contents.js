const MOBILE_MAX_WIDTH = 680;

const ENV_PC = 0;
const ENV_MOBILE = 1;

const ELEMENT_TOC = {
  display: ['pagetoc', 'pagetoc-mobile'],
  toc: ['righttoc', 'bottomtoc'],
};

const tocMap = new Map();
let observer;

let environment;
let onlyActive = null;

const isChromium = !!window.chrome;

const addActive = entry => {
  if (onlyActive !== null) {
    onlyActive.classList.remove('active');
    onlyActive = null;
  }
  const active = tocMap.get(entry.target);
  active.classList.add('active');

  if (environment === ENV_PC) {
    return;
  }

  // TODO: Only chromium operates differently, so the process is temporarily divided and dealt with as an emergency measure.
  //       However, even this is not sufficient...
  if (isChromium) {
    active.addEventListener('scrollend', ev => ev.scrollIntoView({ inline: 'center' }), { once: true, passive: true });
    return;
  }

  active.scrollIntoView({ inline: 'center' });
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

const initialize = () => {
  observer = new IntersectionObserver(
    entries => {
      for (const x of entries) {
        x.isIntersecting ? addActive(x) : removeActive(x);
      }
    },
    {
      root: document.getElementById('content main'),
      threshold: 1.0,
    },
  );

  environment = window.innerWidth >= MOBILE_MAX_WIDTH ? ENV_PC : ENV_MOBILE;

  const nav = document.createElement('nav');
  nav.setAttribute('id', ELEMENT_TOC.display[environment]);

  for (const el of document.getElementById('main').querySelectorAll('a.header')) {
    observer.observe(el);

    const link = document.createElement('a');

    link.appendChild(document.createTextNode(el.text));
    link.href = el.href;
    link.classList.add(el.parentElement.tagName);

    nav.appendChild(link);
    tocMap.set(el, link);
  }

  const toc = document.getElementById(ELEMENT_TOC.toc[environment]);
  toc.setAttribute('display', 'block');
  toc.appendChild(nav);
};

export const tocReset = () => {
  const toc = document.getElementById(ELEMENT_TOC.toc[environment]);
  toc.setAttribute('display', 'none');
  toc.removeChild(document.getElementById(ELEMENT_TOC.display[environment]));

  tocMap.clear();
  observer.disconnect();

  initialize();
};

export const initTableOfContents = () => {
  initialize();

  matchMedia(`(min-width: ${MOBILE_MAX_WIDTH}px)`).addEventListener('change', tocReset, {
    once: false,
    passive: true,
  });
};
