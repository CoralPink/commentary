export const VideoProc = (document: Document): void => {
  for (const video of document.querySelectorAll<HTMLVideoElement>('video')) {
    const parent = video.parentNode;

    if (!parent) {
      continue;
    }

    // Set Up in Bulk
    video.setAttribute('preload', 'none');
    video.setAttribute('controls', '');
  }
};
