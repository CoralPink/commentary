import type { Disposer } from './types.ts';

import { ELEMENT_YOUTUBE, ROOT_PATH } from '../constants.ts';

const SRC_URL = 'https://www.youtube.com/embed/';

class YouTubeVideo extends HTMLElement {
  constructor() {
    super();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('youtube.css', `${ROOT_PATH}css/`).href;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(link);
  }

  connectedCallback(): void {
    const id = this.dataset['id'];

    if (id === undefined) {
      console.warn('youtube id missing');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `${SRC_URL}${id}`;
    iframe.allow = 'fullscreen';

    this.shadowRoot!.append(iframe);
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
