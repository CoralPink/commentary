import hljs from './highlight.js/build/highlight.js';
import { containsNerdFontIcon, extractLanguage } from './hl-language.js';

import type { Payload } from './hl-types';

type HighlightRequest = [text: string, lang: string];

self.onmessage = (ev: MessageEvent<HighlightRequest>): void => {
  try {
    const highlightCode = hljs.highlight(ev.data[0], {
      language: extractLanguage(ev.data[1]),
      ignoreIllegals: false,
    }).value;

    const needNerdFonts = containsNerdFontIcon(ev.data[0]);

    postMessage({ highlightCode, needNerdFonts } as Payload);
  } catch (err) {
    const error = String(err instanceof Error ? err.message : err);
    postMessage({ error } as Payload);
  }
};
