export const getRootVariable = name => {
  try {
    return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch (err) {
    throw new Error(`Failed to get CSS variable: ${name}`, err);
  }
};

export const getRootVariableNum = name => {
  const value = getRootVariable(name);
  const num = Number.parseInt(value, 10);

  if (Number.isNaN(num)) {
    throw new Error(`CSS variable "${name}" value "${value}" could not be parsed as a number`);
  }

  return num;
};

export const loadStyleSheet = fileName => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `./${fileName}`;

  document.head.appendChild(link);
};

export const unloadStyleSheet = fileName => {
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    if (link.href.endsWith(`css/${fileName}.css`)) {
      link.parentNode.removeChild(link);
    }
  }
};
