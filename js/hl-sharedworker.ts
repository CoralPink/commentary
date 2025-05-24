// @ts-ignore
import hljs from './highlight.js/build/highlight.js';
import type { WorkerResponse } from './hl-types';

const DELETEING_PREFIX_LENGTH = 'language-'.length;

// Unicode Private Use Area (PUA) range used by Nerd Fonts
const NERD_FONT_UNICODE_RANGE = /[\uE000-\uF8FF]/;
const containsNerdFontIcon = (text: string): boolean => NERD_FONT_UNICODE_RANGE.test(text);

type Request = {
  id: number;
  text: string;
  lang: string;
};

(self as unknown as SharedWorkerGlobalScope).onconnect = ev => {
  const port = ev.ports[0];

  port.onmessage = (msg: MessageEvent<Request>) => {
    const { id, text, lang } = msg.data;

    const highlightCode = hljs.highlight(text, {
      language: lang.slice(DELETEING_PREFIX_LENGTH),
      ignoreIllegals: true,
    }).value;

    const needNerdFonts = containsNerdFontIcon(text);

    port.postMessage({ id, payload: { highlightCode, needNerdFonts } } as WorkerResponse);
  };
};
