import { highlight } from './highlight.js/build/highlight.js';

self.onmessage = ev => {
  postMessage(
    highlight(ev.data[0], {
      language: ev.data[1].slice(9), // Remove the string "language-" before passing.
      ignoreIllegals: true,
    }).value,
  );
};
