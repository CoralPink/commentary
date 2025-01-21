import { getRootVariable } from './css-loader';

const INTERVAL_MS = 8;
const TIMEOUT_MS = 50;

interface ImageSrc {
  light: string;
  dark: string;
}

interface ReplaceImageObject {
  id: string;
  src: ImageSrc;
  alt: string;
}

const waitForStyle = (property: string): Promise<string> => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const checkStyle = () => {
      const value = getRootVariable(property);

      if (value !== '') {
        resolve(value);
        return;
      }
      if (Date.now() - start >= TIMEOUT_MS) {
        reject(new Error(`Timeout: ${property}`));
        return;
      }
      setTimeout(checkStyle, INTERVAL_MS);
    };

    checkStyle();
  });
};

const replaceProc = async (replaceImageObjectArray: ReplaceImageObject[]): Promise<void> => {
  const scheme = await waitForStyle('--color-scheme');

  for (const x of replaceImageObjectArray) {
    const elm = document.getElementById(x.id);

    if (elm === null) {
      console.warn(`id: ${x.id} element does not exist`);
      continue;
    }
    const img = document.createElement('img');

    img.setAttribute('id', x.id);
    img.setAttribute('src', scheme === 'light' ? x.src.light : x.src.dark);
    img.setAttribute('alt', x.alt);
    img.setAttribute('decoding', 'lazy');

    elm.replaceWith(img);
  }
};

export const replaceId = (replaceImageObjectArray: ReplaceImageObject[]): void => {
  replaceProc(replaceImageObjectArray);

  const observer = new MutationObserver(mutations => {
    for (const x of mutations) {
      if (x.attributeName === 'class') {
        replaceProc(replaceImageObjectArray);
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
};
