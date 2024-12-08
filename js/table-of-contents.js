import { getRootVariableNum } from './css-loader.js';

const ENV_PC = 0;
const ENV_MOBILE = 1;

const ELEMENT_TOC = ['righttoc', 'bottomtoc'];

const mobileMaxWidth = getRootVariableNum('--mobile-max-width');

const tocMap = new Map();
let observer;

let environment;
let onlyActive = null;

let currentInlineCenter = null;

const scrollCenter = () => {
  if (environment === ENV_PC || currentInlineCenter === null) {
    return;
  }
  setTimeout(() => {
    currentInlineCenter.scrollIntoView({ inline: 'center' });
  });
};

const addActive = entry => {
  if (onlyActive !== null) {
    onlyActive.classList.remove('active');
    onlyActive = null;
  }
  const target = tocMap.get(entry.target);
  target.classList.add('active');
  target.setAttribute('aria-current', 'true');

  currentInlineCenter = target;
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
  const target = tocMap.get(entry.target);
  target.classList.remove('active');
  target.removeAttribute('aria-current');
};

function* reverseItr(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    yield array[i];
  }
}

const initialize = () => {
  observer = new IntersectionObserver(
    entries => {
      for (const x of reverseItr(entries)) {
        x.isIntersecting ? addActive(x) : removeActive(x);
      }
      scrollCenter();
    },
    { threshold: 1.0 },
  );

  environment = window.innerWidth >= mobileMaxWidth ? ENV_PC : ENV_MOBILE;

  const nav = document.createElement('nav');
  nav.setAttribute('id', 'pagetoc');
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Table of Contents');

  for (const el of document.getElementById('article').querySelectorAll('a.header')) {
    observer.observe(el);

    const link = document.createElement('a');

    link.appendChild(document.createTextNode(el.text));
    link.href = el.href;
    link.classList.add(el.parentElement.tagName);

    nav.appendChild(link);
    tocMap.set(el, link);
  }

  const toc = document.getElementById('table-of-contents');
  toc.classList.add(ELEMENT_TOC[environment]);
  toc.appendChild(nav);
};

export const tocReset = () => {
  const toc = document.getElementById('table-of-contents');

  toc.classList.remove(ELEMENT_TOC[environment]);
  toc.removeChild(document.getElementById('pagetoc'));

  tocMap.clear();
  observer.disconnect();

  initialize();
};

export const initTableOfContents = () => {
  initialize();

  window
    .matchMedia(`(min-width: ${mobileMaxWidth}px)`)
    .addEventListener('change', tocReset, { once: false, passive: true });
};
