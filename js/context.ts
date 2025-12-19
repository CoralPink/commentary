import { fetchText } from './utils/fetch.ts';

export type NavigationContext = {
  next: URL;
  article: HTMLElement;
  title: HTMLTitleElement;
  generation: AbortSignal;
};

let generationScope: AbortController | null = null;

const beginGenerationScope = (): AbortSignal => {
  if (generationScope) {
    generationScope.abort();
  }

  generationScope = new AbortController();
  return generationScope.signal;
};

const getNextContent = async (next: URL, signal: AbortSignal): Promise<string | null> => {
  let htmlText: string;

  try {
    htmlText = await fetchText(next.pathname, { signal });
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return null;
  }

  if (signal.aborted) {
    return null;
  }

  return htmlText;
};

export const prepareNavigation = async (next: URL): Promise<NavigationContext | null> => {
  const generation = beginGenerationScope();

  const htmlText = await getNextContent(next, generation);

  if (htmlText === null) {
    return null;
  }

  const parsed = new DOMParser().parseFromString(htmlText, 'text/html');

  const article = parsed.getElementById('article');
  const title = parsed.querySelector('title');

  if (!article || !title) {
    console.error('prepareNavigation: required elements not found.');
    return null;
  }

  return { next, article, title, generation };
};
