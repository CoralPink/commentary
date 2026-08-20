import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import diff from 'highlight.js/lib/languages/diff';
import json from 'highlight.js/lib/languages/json';
import lua from 'highlight.js/lib/languages/lua';
import txt from 'highlight.js/lib/languages/plaintext';
import vim from 'highlight.js/lib/languages/vim';

const LANGUAGE_PREFIX = 'language-';
const CODE_BLOCK_PREFIX = 'code-';
const CODE_BLOCK_ID_WIDTH = 3;

let codeBlockId = 0;

// Unicode Private Use Area range used by Nerd Fonts
// - U+E000〜U+F8FF (BMP PUA)
// - U+F0000〜U+FFFFD (Supplementary PUA-A)
const NERD_FONT_UNICODE_RANGE = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}]/u;

const containsNerdFontIcon = (text: string): boolean => NERD_FONT_UNICODE_RANGE.test(text);

const createCopyButton = (document: Document, targetId: string): HTMLButtonElement => {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'copy-button';
  button.ariaLabel = 'Copy to Clipboard';

  button.setAttribute('commandfor', targetId);
  button.setAttribute('command', '--copy');

  const icon = document.createElement('span');
  icon.className = 'icon-copy fa-icon';

  button.append(icon);

  const result = document.createElement('span');
  result.className = 'copy-result';
  result.setAttribute('role', 'status');

  button.append(result);

  return button;
};

const createCodeBlock = (document: Document, pre: HTMLPreElement, copyable: boolean): HTMLDivElement => {
  const block = document.createElement('div');
  const id = `${CODE_BLOCK_PREFIX}${String(codeBlockId++).padStart(CODE_BLOCK_ID_WIDTH, '0')}`;

  block.className = 'code-block';
  block.id = id;

  pre.replaceWith(block);
  block.append(pre);

  if (copyable) {
    block.append(createCopyButton(document, id));
  }

  return block;
};

const getLanguage = (code: HTMLElement): string => {
  const lang = [...code.classList].find(x => x.startsWith(LANGUAGE_PREFIX));

  if (lang === undefined) {
    throw new Error('Code block has no language class');
  }

  return lang.slice(LANGUAGE_PREFIX.length);
};

export const HighlightProc = (document: Document): void => {
  for (const code of document.querySelectorAll<HTMLElement>('pre code')) {
    const language = getLanguage(code);

    code.setAttribute('translate', 'no');

    if (containsNerdFontIcon(code.textContent)) {
      code.classList.add('needs-nerd-font');
    }
    code.innerHTML = hljs.highlight(code.textContent, { language }).value;

    createCodeBlock(document, code.parentElement! as HTMLPreElement, language !== 'txt');
  }
};

(() => {
  // highlight.js register
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('diff', diff);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('lua', lua);
  hljs.registerLanguage('txt', txt);
  hljs.registerLanguage('vim', vim);
})();
