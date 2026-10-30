import { ELEMENT_YOUTUBE } from './element.ts';
import type { Disposer } from './types.ts';

import { ROOT_PATH } from '../constants.ts';

const SRC_URL = 'https://www.youtube.com/';

const getVideoTitle = async (id: string): Promise<string> => {
  const url = new URL(`${SRC_URL}oembed`);
  url.searchParams.set('url', `https://www.youtube.com/watch?v=${id}`);
  url.searchParams.set('format', 'json');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YouTube oEmbed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (typeof data !== 'object' || data === null || !('title' in data) || typeof data.title !== 'string') {
    throw new Error('Invalid YouTube oEmbed response');
  }

  return data.title;
};

class YouTubeVideo extends HTMLElement {
  constructor() {
    super();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('youtube.css', `${ROOT_PATH}css/`).href;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(link);
  }

  async connectedCallback(): Promise<void> {
    const id = this.dataset['id'];

    if (id === undefined) {
      console.warn('youtube id missing');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.loading = 'lazy';
    iframe.title = await getVideoTitle(id);
    iframe.src = `${SRC_URL}embed/${id}`;
    iframe.allow = 'fullscreen';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    this.shadowRoot!.append(iframe);
  }

  disconnectedCallback(): void {
    this.shadowRoot!.querySelector('iframe')?.remove();
  }
}

const registry = (name: string): void => {
  if (customElements.get(name) !== undefined) {
    return;
  }
  customElements.define(name, YouTubeVideo);
};

export const initialize = (_html: HTMLElement): Disposer => {
  registry(ELEMENT_YOUTUBE);

  return () => {}; // no-op dispose
};
