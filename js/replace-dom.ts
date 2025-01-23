import { getRootVariable } from './css-loader';

const INTERVAL_MS = 50;
const TIMEOUT_MS = 1000;

const BATCH_SIZE = 2;

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
        reject(new Error(`Timeout waiting for CSS variable "${property}" after ${TIMEOUT_MS}ms`));
        return;
      }
      setTimeout(checkStyle, INTERVAL_MS);
    };

    checkStyle();
  });
};

const debounce = <T extends BaseObject>(fn: (...args: T[]) => void, delay: number): ((...args: T[]) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const processBatch = (batch: ImageObject[], scheme: string) => {
  for (const x of batch) {
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

const replaceProc = async (imageObjectArray: ImageObject[]): Promise<void> => {
  let scheme: string;

  try {
    scheme = await waitForStyle('--color-scheme');
  } catch (error) {
    console.error('Failed to get color scheme:', error);
    return;
  }

  for (let i = 0; i < imageObjectArray.length; i += BATCH_SIZE) {
    requestAnimationFrame(() => processBatch(imageObjectArray.slice(i, i + BATCH_SIZE), scheme));
  }
};

/**
 * Replaces images based on color scheme and observes class changes.
 * @param imageObjectArray - Array of image objects to process
 * @returns A cleanup function that disconnects the observer when called
 */
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
