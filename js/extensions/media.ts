import Plyr from 'plyr';

import { ROOT_PATH } from '../constants.ts';
import { loadStyleSheet } from '../utils/css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

const VIDEO_RESTART_OFFSET = 0.2;

let loadStyleSheetPromise: ReturnType<typeof loadStyleSheet> | undefined;

const ensureStylesheetLoaded = (): ReturnType<typeof loadStyleSheet> => {
  if (!loadStyleSheetPromise) {
    loadStyleSheetPromise = loadStyleSheet(`${ROOT_PATH}${STYLE_PLYR}`);
  }
  return loadStyleSheetPromise;
};

export const initialize = (html: HTMLElement): (() => void) => {
  ensureStylesheetLoaded();

  const videos = Array.from(html.querySelectorAll<HTMLVideoElement>('video'));

  if (videos.length === 0) {
    return () => {}; // no-op dispose
  }

  const plyrInstances: Plyr[] = [];

  const setPlyr = async (video: HTMLVideoElement): Promise<Plyr> => {
    await ensureStylesheetLoaded();

    const instance = new Plyr(video);
    plyrInstances.push(instance);

    // Most of the videos on this site start with a fade-in,
    // so unless you intentionally shift the starting position, they are all black...!
    video.addEventListener('ended', (): void => {
      video.currentTime = VIDEO_RESTART_OFFSET;
    });

    return instance;
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
