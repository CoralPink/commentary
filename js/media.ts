import Plyr from 'plyr';
import { loadStyleSheet } from './css-loader.ts';

const STYLE_PLYR = 'css/plyr.css';

export const initMedia = async (): Promise<void> => {
  const video = document.querySelectorAll('video');

  if (video.length === 0) {
    return;
  }

  const rootPath = document.getElementById('bookjs')?.dataset.pathtoroot;

  if (!rootPath) {
    console.error('initMedia: Unable to determine root path from #bookjs element');
    return;
  }

  try {
    await loadStyleSheet(`${rootPath}${STYLE_PLYR}`);
  } catch (err) {
    console.error('Failed to load Plyr CSS, proceeding without styles:', err);
    return;
  }

  Plyr.setup(video);
};
