import { ROOT_PATH } from '../constants.ts';

import type { AbortableOptions } from './type.ts';

const removeStyleSheet = (fileName: string): boolean => {
  const resolvedHref = new URL(fileName, ROOT_PATH).href;

  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
    if (link.href !== resolvedHref) {
      continue;
    }

    link.onload = null;
    link.onerror = null;

    link.remove();

    return true;
  }

  return false;
};

export const loadStyleSheet = (fileName: string, options: AbortableOptions = {}): Promise<void> => {
  if (options.signal?.aborted) {
    throw new Error('Stylesheet loading was aborted');
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = new URL(fileName, ROOT_PATH).href;

    const ac = new AbortController();

    options.signal?.addEventListener(
      'abort',
      () => {
        link.remove();
        reject(new Error('Stylesheet loading was aborted'));
      },
      {
        passive: true,
        signal: ac.signal,
      },
    );

    const cleanup = () => {
      link.onload = null;
      link.onerror = null;

      ac.abort();
    };

    link.onload = () => {
      cleanup();
      resolve();
    };
    link.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load stylesheet: ${fileName}`));
    };

    document.head.append(link);
  });
};

export const unloadStyleSheet = (fileName: string, throwIfNotFound = false): void => {
  if (!removeStyleSheet(fileName) && throwIfNotFound) {
    throw new Error(`Stylesheet not found: ${fileName}`);
  }
};
