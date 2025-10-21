export const getRootVariable = (name: string): string => {
  try {
    return globalThis.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error.';
    throw new Error(`Failed to get CSS variable: ${name}. ${msg}`);
  }
};

export const getRootVariableNum = (name: string): number => {
  const value = getRootVariable(name);
  const num = Number.parseFloat(value);

  if (Number.isNaN(num)) {
    throw new Error(`CSS variable "${name}" value "${value}" could not be parsed as a number`);
  }

  return num;
};

const removeStyleSheet = (fileName: string): boolean => {
  const resolvedHref = new URL(fileName, globalThis.location.href).href;

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

export const loadStyleSheet = (fileName: string, options: { signal?: AbortSignal } = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new Error('Stylesheet loading was aborted'));
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(fileName, globalThis.location.href).href;

    const abortHandler = () => {
      if (removeStyleSheet(fileName)) {
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
