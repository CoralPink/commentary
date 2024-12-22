import { getRootVariable } from './css-loader.js';

const DELAY_MS = 4;  // I feel like it needs to have some delay to work properly...

const replaceProc = replaceImageObjectArray => {
  setTimeout(() => {
    const scheme = getRootVariable('--color-scheme');

    for (const x of replaceImageObjectArray) {
      const img = document.createElement('img');

      img.setAttribute('id', x.id);
      img.setAttribute('src', scheme === 'light'? x.src.light : x.src.dark);
      img.setAttribute('alt', x.alt);
      img.setAttribute('decoding', 'lazy');

      document.getElementById(x.id).replaceWith(img);
    }
  }, DELAY_MS);
};

export const replaceId = replaceImageObjectArray => {
  replaceProc(replaceImageObjectArray);

  const observer = new MutationObserver(mutations => {
    for (const x of mutations) {
      if (x.attributeName === 'class') {
        replaceProc(replaceImageObjectArray);
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true, attiributeFilter: ['class'] });
};
