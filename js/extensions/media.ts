import Plyr from 'plyr';

import type { Disposer } from './types.ts';

import { ROOT_PATH } from '../constants.ts';
import { loadStyleSheet } from '../utils/css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

const VIDEO_REQUIRED_BUFFER = 2.0;
const VIDEO_RESTART_OFFSET = 0.2;

let loadStyleSheetPromise: ReturnType<typeof loadStyleSheet> | undefined;

const plyrInstances: Plyr[] = [];

const onVideoEnded = (ev: Event): void => {
  (ev.currentTarget as HTMLVideoElement).currentTime = VIDEO_RESTART_OFFSET;
};

const getBufferedGap = (video: HTMLVideoElement): number => {
  const buffered = video.buffered;
  const t = video.currentTime;

  for (let i = 0; i < buffered.length; i++) {
    if (t >= buffered.start(i) && t <= buffered.end(i)) {
      return buffered.end(i) - t;
    }
  }

  return 0;
};

const isSafeToPlay = (video: HTMLVideoElement): boolean =>
  video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA && getBufferedGap(video) >= VIDEO_REQUIRED_BUFFER;

const waitForSafePlay = (video: HTMLVideoElement): Promise<void> => {
  const ac = new AbortController();

  return new Promise(resolve => {
    const check = () => {
      if (!isSafeToPlay(video)) {
        return;
      }
      ac.abort();
      resolve();
    };

    video.addEventListener('timeupdate', check, {
      once: false,
      passive: true,
      signal: ac.signal,
    });

    video.addEventListener('progress', check, {
      once: false,
      passive: true,
      signal: ac.signal,
    });
  });
};

const setPlyr = async (video: HTMLVideoElement): Promise<void> => {
  // If `preload=none` is set, pressing the `Picture-in-Picture` button before video playback begins will cause an error,
  // so we dynamically rewrite the setting.
  if (video.preload === 'none') {
    video.preload = 'metadata';
  }

  await loadStyleSheetPromise;

  const plyr = new Plyr(video);

  // Set the playback start criteria for the first playback more flexibly, without using the `canplay` event.
  plyr.once('play', async () => {
    if (isSafeToPlay(video)) {
      return;
    }

    // Stopping temporarily due to insufficient buffer space
    video.pause();

    await waitForSafePlay(video);
    video.play();
  });

  plyrInstances.push(plyr);

  // Most of the videos on this site start with a fade-in,
  // so unless you intentionally shift the starting position, they are all black...!
  video.addEventListener('ended', onVideoEnded, {
    once: false,
    passive: true,
  });
};

const setupMedia = (entries: IntersectionObserverEntry[], obs: IntersectionObserver): void => {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }

    const video = entry.target as HTMLVideoElement;
    setPlyr(video);

    obs.unobserve(video);
  }
};

export const initialize = (html: HTMLElement): Disposer => {
  if (!loadStyleSheetPromise) {
    loadStyleSheetPromise = loadStyleSheet(`${ROOT_PATH}${STYLE_PLYR}`);
  }

  const videos = Array.from(html.querySelectorAll<HTMLVideoElement>('video'));

  if (videos.length === 0) {
    return () => {}; // no-op dispose
  }

  const obs = new IntersectionObserver(setupMedia, { rootMargin: '3%' });

  for (const x of videos) {
    obs.observe(x);
  }

  return (): void => {
    obs.disconnect();

    for (const x of videos) {
      x.removeEventListener('ended', onVideoEnded);
    }
    for (const x of plyrInstances) {
      x.destroy();
    }
    plyrInstances.length = 0;
  };
};
