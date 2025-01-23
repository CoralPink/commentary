import { getRootVariable } from './css-loader';

const INTERVAL_MS = 8;
const TIMEOUT_MS = 50;

interface BaseObject {
  id: string;
}

interface ImageSrc {
  light: string;
  dark: string;
}

interface ImageObject extends BaseObject {
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

const replaceProc = async (imageObjectArray: ImageObject[]): Promise<void> => {
  let scheme: string;
  try {
    scheme = await waitForStyle('--color-scheme');
  } catch (error) {
    console.error('Failed to get color scheme:', error);
    scheme = 'light'; // fallback to light theme
  }

  for (const x of imageObjectArray) {
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

const debounce = <T extends BaseObject>(fn: (...args: T[]) => void, delay: number): ((...args: T[]) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const replaceId = (imageObjectArray: ImageObject[]): (() => void) => {
  replaceProc(imageObjectArray);

  const debouncedReplace = debounce(() => replaceProc(imageObjectArray), 150);

  const observer = new MutationObserver(mutations => {
    for (const x of mutations) {
      if (x.attributeName === 'class') {
        debouncedReplace();
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Cleanup function that can be called when needed
  return () => {
    observer.disconnect();
  };
};
