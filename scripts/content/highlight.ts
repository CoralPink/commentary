import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import diff from 'highlight.js/lib/languages/diff';
import json from 'highlight.js/lib/languages/json';
import lua from 'highlight.js/lib/languages/lua';
import vim from 'highlight.js/lib/languages/vim';

const LANGUAGE_PREFIX = 'language-';

// Unicode Private Use Area range used by Nerd Fonts
// - U+E000〜U+F8FF (BMP PUA)
// - U+F0000〜U+FFFFD (Supplementary PUA-A)
const NERD_FONT_UNICODE_RANGE = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}]/u;
const containsNerdFontIcon = (text: string): boolean => NERD_FONT_UNICODE_RANGE.test(text);

const createCopyButton = (document: Document): HTMLButtonElement => {
  const button = document.createElement('button');

  button.className = 'copy-button';
  button.setAttribute('aria-label', 'Copy to Clipboard');

  const icon = document.createElement('div');
  icon.className = 'icon-copy fa-icon';

  button.append(icon);

  return button;
};

const highlighting = (code: HTMLPreElement): string | null => {
  const langClass = [...code.classList].find(x => x.startsWith(LANGUAGE_PREFIX));

  if (langClass === undefined) {
    return null;
  }

  const lang = langClass.slice(LANGUAGE_PREFIX.length);

  try {
    return hljs.highlight(code.textContent, {
      language: lang,
    }).value;
  } catch {
    return null;
  }
};

export const HighlightProc = (document: Document): void => {
  const clipButton = createCopyButton(document);

  for (const code of document.querySelectorAll<HTMLPreElement>('pre code:not(.language-txt)')) {
    const highlightedCode = highlighting(code);

    if (highlightedCode === null) {
      continue;
    }

    if (containsNerdFontIcon(code.textContent)) {
      code.classList.add('needs-nerd-font');
    }
    code.setAttribute('translate', 'no');
    code.innerHTML = highlightedCode;

    if (code.parentElement === null) {
      continue;
    }
    code.parentElement.prepend(clipButton.cloneNode(true));
  }
};

(() => {
  // highlight.js register
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('diff', diff);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('lua', lua);
  hljs.registerLanguage('vim', vim);
})();
