import Plyr from 'plyr';

import type { Disposer } from './types.ts';

import { ROOT_PATH } from '../constants.ts';
import { loadStyleSheet } from '../utils/css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

const VIDEO_RESTART_OFFSET = 0.2;

let loadStyleSheetPromise: ReturnType<typeof loadStyleSheet> | undefined;

const plyrInstances: Plyr[] = [];

const onVideoEnded = (ev: Event): void => {
  (ev.currentTarget as HTMLVideoElement).currentTime = VIDEO_RESTART_OFFSET;
};

const setPlyr = async (video: HTMLVideoElement, signal: AbortSignal): Promise<void> => {
  await loadStyleSheetPromise;

  plyrInstances.push(new Plyr(video));

  // Most of the videos on this site start with a fade-in,
  // so unless you intentionally shift the starting position, they are all black...!
  video.addEventListener('ended', onVideoEnded, {
    once: false,
    passive: true,
    signal,
  });
};

const setupMedia =
  (signal: AbortSignal) =>
  (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const video = entry.target as HTMLVideoElement;
      setPlyr(video, signal);

      obs.unobserve(video);
    }
  };

export const initialize = (html: HTMLElement): Disposer => {
  if (!loadStyleSheetPromise) {
    loadStyleSheetPromise = loadStyleSheet(`${ROOT_PATH}${STYLE_PLYR}`);
  }

  const videos = Array.from(html.querySelectorAll<HTMLVideoElement>('video'));
  const ac = new AbortController();

  if (videos.length === 0) {
    return () => {}; // no-op dispose
  }

  const obs = new IntersectionObserver(setupMedia(ac.signal), {
    rootMargin: '3%',
  });

  for (const x of videos) {
    obs.observe(x);
  }

  return (): void => {
    obs.disconnect();
    ac.abort();

    for (const x of plyrInstances) {
      x.destroy();
    }

    plyrInstances.length = 0;
  };
};
