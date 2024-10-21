export const getRootVariableNum = name =>
  Number.parseInt(window.getComputedStyle(document.documentElement).getPropertyValue(name), 10);
