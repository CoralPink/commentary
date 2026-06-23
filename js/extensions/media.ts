import '@videojs/html/video/player';
import '@videojs/html/video/minimal-skin';

import type { Disposer } from './types.ts';

const VIDEO_RESTART_OFFSET = 0.2;

const onVideoEnded = (ev: Event): void => {
  (ev.currentTarget as HTMLVideoElement).currentTime = VIDEO_RESTART_OFFSET;
};

const setupMedia =
  (signal: AbortSignal) =>
  (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const video = entry.target as HTMLVideoElement;

      video.poster = video.dataset['poster' as keyof DOMStringMap] || video.poster || '';

      // Most of the videos on this site start with a fade-in,
      // so unless you intentionally shift the starting position, they are all black...!
      video.addEventListener('ended', onVideoEnded, {
        passive: true,
        signal,
      });

      obs.unobserve(video);
    }
  };

export const initialize = (html: HTMLElement): Disposer => {
  const videos = Array.from(html.querySelectorAll<HTMLVideoElement>('video'));

  if (videos.length === 0) {
    return () => {}; // no-op dispose
  }

  const ac = new AbortController();
  const obs = new IntersectionObserver(setupMedia(ac.signal), {
    rootMargin: '30% 0%',
  });

  for (const x of videos) {
    obs.observe(x);
  }

  return (): void => {
    obs.disconnect();
    ac.abort();
  };
};
