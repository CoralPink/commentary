import hljs from './highlight.js/build/highlight.js';

onmessage = ev => {
  postMessage(
    hljs.highlight(ev.data[0], {
      language: ev.data[1].slice(9),  //Remove the string "language-" before passing.
      ignoreIllegals: true,
    }).value,
  );
};
