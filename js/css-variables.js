export const getRootVariable = name => window.getComputedStyle(document.documentElement).getPropertyValue(name);

export const getRootVariableNum = name => {
  const value = getRootVariable(name);
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) {
    console.warn(`CSS variable "${name}" value "${value}" could not be parsed as a number`);
    return 0; // or throw an error, depending on your error handling strategy
  }
  return num;
};
