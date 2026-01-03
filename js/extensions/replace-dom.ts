/*
 * TODO:
 * Ideally, I think using the `beforeunload` event to call the cleanup process would be best,
 * but unfortunately, it wasn't supported in the Safari on iOS...
 *
 * (However, if you ask whether I tested it on other browsers, I haven't!)
 *
 * ```html
 * <script type="module">
 * document.getElementById('article').addEventListener('replaceEvent', async (ev) => {
 *   const cleanupFn = ev.detail.func?.([
 *     { id: 'XXXX',
 *      src: { light:'img/YYYY.webp', dark: 'img/ZZZZ.webp'},
 *      alt: 'XXXX',
 *    },
 *   ]);
 *
 *   window.addEventListener('beforeunload', () => {
 *     if (!cleanupFn) {
 *       return;
 *     }
 *     cleanupFn();
 *     cleanupFn = null;
 *   });
 * });
 * </script>
 * ```
 *
 * No alternative solution has been found yet, so it can't be used!
 *
 * refs: https://developer.mozilla.org/ja/docs/Web/API/Window/beforeunload_event
 * refs: https://bugs.webkit.org/show_bug.cgi?id=219102
 */

import type { Disposer } from './types.ts';

import { debounce } from '../utils/timing.ts';

const INTERVAL_MS = 50;
const TIMEOUT_MS = 1000;

const BATCH_SIZE = 2;

const EVENT_REPLACE = 'replaceEvent';

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
      // TODO: This function has been deprecated, so switch to another method!
      // const value = getRootVariable(property);
      const value = '';

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

export const initialize = (html: HTMLElement): Disposer => {
  html.dispatchEvent(new CustomEvent(EVENT_REPLACE, { detail: { func: replaceId } }));

  return () => {
    // TODO: ...
  }
};
