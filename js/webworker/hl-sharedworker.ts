import { containsNerdFontIcon, extractLanguage } from './hl-language.ts';
import type { Payload, WorkerResponse } from './hl-types.ts';

import hljs from '../highlight.js';
import type { UUID } from '../utils/random.ts';

type HighlightRequest = {
  id: UUID;
  text: string;
  lang: string;
};

const sharedWorker = self as unknown as SharedWorkerGlobalScope;

sharedWorker.onconnect = (ev: MessageEvent<HighlightRequest>): void => {
  const port = ev.ports[0];

  // The event of SharedWorkerGlobalScope.onconnect always contains one or more ports
  // according to the specification, but the compiler will warn you about it, so leave it in.
  if (port === undefined) {
    throw new Error('SharedWorker: No port found');
  }

  port.onmessage = (msg: MessageEvent<HighlightRequest>): void => {
    const { id, text, lang } = msg.data;

    try {
      const highlightCode = hljs.highlight(text, {
        language: extractLanguage(lang),
        ignoreIllegals: false,
      }).value;

      const needNerdFonts = containsNerdFontIcon(text);

      port.postMessage({
        id,
        payload: { highlightCode, needNerdFonts } as Payload,
      } as unknown as WorkerResponse);
    } catch (err) {
      const error = String(err instanceof Error ? err.message : err);
      port.postMessage({ id, payload: { error } as Payload } as unknown as WorkerResponse);
    }
  };
};
