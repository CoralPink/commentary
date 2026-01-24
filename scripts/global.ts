export const CLR_RESET = '\x1b[0m';
export const CLR_BC = '\x1b[1;35m';
export const CLR_BG = '\x1b[1;32m';
export const CLR_G = '\x1b[32m';

export const PATH_DIRECTORY = '../commentary/';
export const HTML_TOC = 'toc.html';

const URL_PRODUCTION = 'https://coralpink.github.io/commentary/';
const URL_LOCALHOST = 'http://localhost:8000/commentary/';

const getArgValue = (name: string): string | undefined => {
  const index = Deno.args.indexOf(name);
  return index >= 0 ? Deno.args[index + 1] : undefined;
};

const rootFromArg = getArgValue('--root');

export const isDebug = Deno.args.includes('--debug');
export const rootPath = rootFromArg ?? (isDebug ? URL_LOCALHOST : URL_PRODUCTION);
