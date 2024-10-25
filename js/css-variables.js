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
