export const getRootVariable = name => window.getComputedStyle(document.documentElement).getPropertyValue(name);

export const getRootVariableNum = name => Number.parseInt(getRootVariable(name), 10);
