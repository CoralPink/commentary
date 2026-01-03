import { ROOT_PATH } from '../constants.ts';

import type { AbortableOptions } from './type.ts';

const removeStyleSheet = (fileName: string): boolean => {
  const resolvedHref = new URL(fileName, ROOT_PATH).href;

  const isStylesheetLink = (element: Element): element is HTMLLinkElement =>
    element instanceof HTMLLinkElement && element.rel === 'stylesheet';

  const stylesheetLinks = Array.from(document.querySelectorAll('link')).filter(isStylesheetLink);

  for (const link of stylesheetLinks) {
    if (link.href !== resolvedHref) {
      continue;
    }

    link.onload = null;
    link.onerror = null;

    link.parentNode?.removeChild(link);

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

    const abortHandler = () => {
      if (link.parentElement?.removeChild(link)) {
        reject(new Error('Stylesheet loading was aborted'));
      }
    };

    const cleanup = () => {
      link.onload = null;
      link.onerror = null;
      options.signal?.removeEventListener('abort', abortHandler);
    };

    options.signal?.addEventListener('abort', abortHandler);

    link.onload = () => {
      cleanup();
      resolve();
    };
    link.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load stylesheet: ${fileName}`));
    };

    document.head.appendChild(link);
  });
};

export const unloadStyleSheet = (fileName: string, throwIfNotFound = false): void => {
  if (!removeStyleSheet(fileName) && throwIfNotFound) {
    throw new Error(`Stylesheet not found: ${fileName}`);
  }
};
