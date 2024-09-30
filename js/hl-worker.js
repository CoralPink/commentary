import { highlight } from './highlight.js/build/highlight.js';

const NERD_FONT_RANGE = /[\uE000-\uF8FF]/;
const containsNerdFontIcon = text => NERD_FONT_RANGE.test(text);

self.onmessage = ev => {
  const highlightCode = highlight(ev.data[0], {
    language: ev.data[1].slice(9), // Remove the string "language-" before passing.
    ignoreIllegals: true,
  }).value;

  const needNerdFonts = containsNerdFontIcon(ev.data[0]);

  postMessage({ highlightCode, needNerdFonts });
};
