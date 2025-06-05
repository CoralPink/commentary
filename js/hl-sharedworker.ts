// @ts-expect-error: I know there is no type information.
import hljs from './highlight.js/build/highlight.js';
import { extractLanguage, containsNerdFontIcon } from './hl-language.ts';

import type { Payload, WorkerResponse } from './hl-types';

type HighlightRequest = {
  id: number;
  text: string;
  lang: string;
};

const sharedWorker = self as unknown as SharedWorkerGlobalScope;

sharedWorker.onconnect = ev => {
  const port = ev.ports[0];

  port.onmessage = (msg: MessageEvent<HighlightRequest>) => {
    const { id, text, lang } = msg.data;

    try {
      const highlightCode = hljs.highlight(text, {
        language: extractLanguage(lang),
        ignoreIllegals: false,
      }).value;

      const needNerdFonts = containsNerdFontIcon(text);

      port.postMessage({ id, payload: { highlightCode, needNerdFonts } as Payload } as unknown as WorkerResponse);
    } catch (err) {
      const error = String(err instanceof Error ? err.message : err);
      port.postMessage({ id, payload: { error } as Payload } as unknown as WorkerResponse);
    }
  };
};
