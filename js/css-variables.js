export const getRootVariableNum = name =>
  Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue(name), 10);
