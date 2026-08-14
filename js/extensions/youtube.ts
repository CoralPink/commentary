import type { Disposer } from './types.ts';

const setupMedia = (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }

    const video = entry.target;

    if (!(video instanceof HTMLDivElement)) {
      continue;
    }

    const id = video.dataset['id'];

    if (id === undefined) {
      continue;
    }

    const iframe = document.createElement('iframe');

    iframe.src = `https://www.youtube.com/embed/${id}`;
    iframe.allow = 'fullscreen';

    video.replaceChildren(iframe);
    obs.unobserve(video);
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
