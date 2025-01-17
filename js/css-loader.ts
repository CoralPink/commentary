export const getRootVariable = (name: string): string => {
  try {
    return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

export const loadStyleSheet = (fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = new URL(fileName, window.location.href).href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${fileName}`));

    document.head.appendChild(link);
  });
};

export const unloadStyleSheet = (fileName: string, throwIfNotFound = false): void => {
  const resolvedHref = new URL(fileName, window.location.href).href;

  const remove = (): boolean => {
    for (const query of Array.from(document.querySelectorAll('link[rel="stylesheet"]'))) {
      const link = query as HTMLLinkElement;

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

  if (!remove() && throwIfNotFound) {
    throw new Error(`Stylesheet not found: ${fileName}`);
  }
};
