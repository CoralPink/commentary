import '@videojs/html/video/player';
import '@videojs/html/video/minimal-skin';

import type { Disposer } from './types.ts';

const VIDEO_RESTART_OFFSET = 0.2;

const onVideoEnded = (ev: Event): void => {
  (ev.currentTarget as HTMLVideoElement).currentTime = VIDEO_RESTART_OFFSET;
};

export const initialize = (html: HTMLElement): Disposer => {
  const videos = Array.from(html.querySelectorAll<HTMLVideoElement>('video'));

  if (videos.length === 0) {
    return () => {}; // no-op dispose
  }

  const ac = new AbortController();

  for (const x of videos) {
    x.addEventListener('ended', onVideoEnded, {
      once: false,
      passive: true,
      signal: ac.signal,
    });
  }

  return (): void => {
    ac.abort();
  };
};
