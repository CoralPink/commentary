import type { Disposer } from './types.ts';

const SRC_URL = 'https://www.youtube.com/embed/';

const setupMedia = (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }

    const div = entry.target;

    if (!(div instanceof HTMLDivElement)) {
      continue;
    }

    const id = div.dataset['id'];

    if (id === undefined) {
      continue;
    }

    const iframe = document.createElement('iframe');

    iframe.src = `${SRC_URL}${id}`;
    iframe.allow = 'fullscreen';

    div.replaceChildren(iframe);
    obs.unobserve(div);
  }
};

export const initialize = (html: HTMLElement): Disposer => {
  const div = Array.from(html.querySelectorAll<HTMLDivElement>('.youtube-video'));

  if (div.length === 0) {
    return () => {}; // no-op dispose
  }

  const obs = new IntersectionObserver(setupMedia, {
    rootMargin: '30% 0%',
  });

  for (const x of div) {
    obs.observe(x);
  }

  return (): void => {
    obs.disconnect();
  };
};
