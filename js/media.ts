import Plyr from 'plyr';

import { ROOT_PATH } from './constants.ts';
import { loadStyleSheet } from './css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

const VIDEO_RESTART_OFFSET = 0.2;

let loadStyleSheetPromise: ReturnType<typeof loadStyleSheet>;

const plyrInstances: Plyr[] = [];

export const setPlyr = async (video: HTMLVideoElement): Promise<void> => {
  await loadStyleSheetPromise;

  plyrInstances.push(new Plyr(video));

  // Most of the videos on this site start with a fade-in,
  // so unless you intentionally shift the starting position, they are all black...!
  video.addEventListener('ended', (): void => {
    video.currentTime = VIDEO_RESTART_OFFSET;
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

const ensureStylesheetLoaded = (): ReturnType<typeof loadStyleSheet> => {
  if (!loadStyleSheetPromise) {
    loadStyleSheetPromise = loadStyleSheet(`${ROOT_PATH}${STYLE_PLYR}`);
  }
  return loadStyleSheetPromise;
};

export const initialize = (): (() => void) => {
  ensureStylesheetLoaded();

  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));

  if (videos.length === 0) {
    return () => {}; // no-op dispose
  }

  const obs = new IntersectionObserver(setupMedia, { rootMargin: '3%' });

  for (const x of Array.from(videos)) {
    obs.observe(x);
  }

  return (): void => {
    obs.disconnect();

    for (const x of plyrInstances) {
      x.destroy();
    }
    plyrInstances.length = 0;
  };
};
