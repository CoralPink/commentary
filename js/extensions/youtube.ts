import type { Disposer } from './types.ts';

const ELEMENT_NAME = 'youtube-video';

const SRC_URL = 'https://www.youtube.com/embed/';

class YouTubeVideo extends HTMLElement {
  connectedCallback(): void {
    const id = this.dataset['id'];

    if (id === undefined) {
      console.warn(`youtube id missing: ${id}`);
      return;
    }

    const iframe = document.createElement('iframe');

    iframe.src = `${SRC_URL}${id}`;
    iframe.allow = 'fullscreen';

    this.replaceChildren(iframe);
  }
}

const registry = (name: string): void => {
  if (customElements.get(name) !== undefined) {
    return;
  }
  customElements.define(name, YouTubeVideo);
};

export const initialize = (_html: HTMLElement): Disposer => {
  registry(ELEMENT_NAME);

  return () => {}; // no-op dispose
};
