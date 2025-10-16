import Plyr from 'plyr';
import { loadStyleSheet } from './css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

export const initMedia = async (): Promise<void> => {
  const video = document.querySelectorAll('video');

  if (video.length === 0) {
    return;
  }

  const rootPath = document.getElementById('bookjs')?.dataset.pathtoroot;
  const loadStyleSheetPromise = loadStyleSheet(`${rootPath}${STYLE_PLYR}`);

  Plyr.setup(video);

  await loadStyleSheetPromise;
};
