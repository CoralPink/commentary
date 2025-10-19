import Plyr from 'plyr';
import { loadStyleSheet } from './css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

const VIDEO_RESTART_OFFSET = 0.2;

let loadStyleSheetPromise: ReturnType<typeof loadStyleSheet>;

export const setPlyr = async (video: HTMLVideoElement): Promise<void> => {
  await loadStyleSheetPromise;

  new Plyr(video);

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

export const initVideo = (): void => {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video')).filter(
    // Exclude <video> elements located under elements that use `slider.ts`.
    video => !video.closest('.slider'),
  );

  if (videos.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(setupMedia, { rootMargin: '3%' });

  for (const x of Array.from(videos)) {
    observer.observe(x);
  }
};

export const initMedia = (rootPath: string): void => {
  if (document.querySelector('video') === null) {
    return;
  }

  loadStyleSheetPromise = loadStyleSheet(`${rootPath}${STYLE_PLYR}`);
};
