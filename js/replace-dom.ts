import { getRootVariable } from './css-loader.ts';
import { debounce } from './timing.ts';

const INTERVAL_MS = 50;
const TIMEOUT_MS = 1000;

const BATCH_SIZE = 2;

type BaseObject = {
  id: string;
};

type ImageSrc = {
  light: string;
  dark: string;
};

type ImageObject = BaseObject & {
  src: ImageSrc;
  alt: string;
};

const waitForStyle = (property: string): Promise<string> => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const checkStyle = (): void => {
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

const processBatch = (batch: ImageObject[], scheme: string) => {
  for (const { id, src, alt } of batch) {
    const elm = document.getElementById(id);

    if (elm === null) {
      console.warn(`id: ${id} element does not exist`);
      continue;
    }
    const img = document.createElement('img');

    img.setAttribute('id', id);
    img.setAttribute('src', scheme === 'light' ? src.light : src.dark);
    img.setAttribute('alt', alt);
    img.setAttribute('loading', 'lazy');

    img.onerror = () => console.error(`Failed to load image for id: ${id}`);

    elm.replaceWith(img);
  }
};

const replaceProc = async (imageObjectArray: ImageObject[]): Promise<void> => {
  try {
    const scheme = await waitForStyle('--color-scheme');

    for (let i = 0; i < imageObjectArray.length; i += BATCH_SIZE) {
      requestAnimationFrame(() => processBatch(imageObjectArray.slice(i, i + BATCH_SIZE), scheme));
    }
  } catch (error) {
    console.error('Failed to get color scheme:', error);
  }
};

/**
 * Replaces images based on color scheme and observes class changes.
 * @param imageObjectArray - Array of image objects to process
 * @returns A cleanup function that disconnects the observer when called
 */
export const replaceId = (imageObjectArray: ImageObject[]): (() => void) => {
  replaceProc(imageObjectArray);

  const debouncedReplaceProc = debounce(() => replaceProc(imageObjectArray), 150);
  const observer = new MutationObserver(() => debouncedReplaceProc());

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => observer.disconnect();
};
