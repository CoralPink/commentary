export const getRootVariable = name => {
  try {
    return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch (err) {
    throw new Error(`Failed to get CSS variable: ${name}`, err);
  }
};

export const getRootVariableNum = name => {
  const value = getRootVariable(name);
  const num = Number.parseFloat(value);

  if (Number.isNaN(num)) {
    throw new Error(`CSS variable "${name}" value "${value}" could not be parsed as a number`);
  }

  return num;
};

export const loadStyleSheet = fileName => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = new URL(fileName, window.location.href).href;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${fileName}`));

    document.head.appendChild(link);
  });
};

export const unloadStyleSheet = (fileName, { throwIfNotFound = false } = {}) => {
  const resolvedHref = new URL(fileName, window.location.href).href;

  const remove = () => {
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (link.href === resolvedHref) {
        link.onload = null;
        link.onerror = null;
        link.parentNode.removeChild(link);
        return true;
      }
    }
    return false;
  };

  if (!remove() && throwIfNotFound) {
    throw new Error(`Stylesheet not found: ${fileName}`);
  }
};
