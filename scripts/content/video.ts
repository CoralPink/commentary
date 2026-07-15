export const VideoProc = (document: Document): void => {
  for (const video of document.querySelectorAll<HTMLVideoElement>('video')) {
    const parent = video.parentNode;

    if (!parent) {
      continue;
    }

    // Set `preload=“none”` for all items at once.
    video.setAttribute('preload', 'none');

    // Build a format compliant with video.js v10
    const player = document.createElement('video-player');
    const skin = document.createElement('video-minimal-skin');

    parent.insertBefore(player, video);

    player.appendChild(skin);
    skin.appendChild(video);
  }
};
