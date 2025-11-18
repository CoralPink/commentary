import { initCodeBlock } from './codeblock.ts';
import { initFootnote } from './footnote.ts';
import { attributeExternalLinks } from './link.ts';
import { doMarkFromUrl } from './mark.ts';
import { startupSearch } from './searcher.ts';
import { registryToc } from './table-of-contents.ts';

const MODULE_PATH_DIRECTORY = `${self.origin}/commentary/`;

const MODULE_REQUIREMENTS: { selector: string; module: string }[] = [
  { selector: '.slider', module: 'slider.js' },
  { selector: 'video', module: 'media.js' },
  { selector: '.replace-element', module: 'replace-dom.js' },
];

type ModuleEntry = {
  importPromise: Promise<void>;
  initialize: (() => void) | undefined;
};

const loadedModules = new Map<string, ModuleEntry>();

const MEDIA_TAGS = [
  'img',
  'source', // (<audio>, <video>)
] as const;

const MEDIA_SELECTOR = MEDIA_TAGS.map(t => `${t}[src]`).join(', ');

let onNavigate: ((url: URL) => void) | null = null;

export const setOnNavigate = (cb: (url: URL) => void): void => {
  onNavigate = cb;
};

const ensureModuleLoaded = (url: string): Promise<void> => {
  if (loadedModules.has(url)) {
    const entry = loadedModules.get(url)!;

    if (entry.initialize !== undefined) {
      entry.initialize();
    }
    return entry.importPromise;
  }

  const importPromise = import(url)
    .then(mod => {
      if (typeof mod.initialize === 'function') {
        loadedModules.set(url, { importPromise, initialize: mod.initialize });
        mod.initialize();
      } else {
        loadedModules.set(url, { importPromise, initialize: undefined });
      }
    })
    .catch(err => {
      console.error(`Failed to load module: ${url}`, err);
      loadedModules.delete(url);
      throw err;
    });

  loadedModules.set(url, { importPromise, initialize: undefined });
  return importPromise;
};

const loadModules = async (): Promise<void> => {
  const require: Promise<void>[] = [];

  for (const req of MODULE_REQUIREMENTS) {
    const url = `${MODULE_PATH_DIRECTORY}${req.module}`;

    if (document.querySelector(req.selector)) {
      require.push(ensureModuleLoaded(url));
    }
  }

  await Promise.all(require);
};

export const initialize = async (): Promise<void> => {
  const promiseLoadModule = loadModules();

  registryToc();
  initCodeBlock();

  doMarkFromUrl();
  attributeExternalLinks();
  initFootnote();

  startupSearch();

  await promiseLoadModule;
};

const setBaseUrl = (elm: Element, url: URL): void => {
  const baseUrl = new URL('./', url).href;

  for (const x of Array.from(elm.querySelectorAll(MEDIA_SELECTOR))) {
    const media = x as HTMLMediaElement;
    const src = media.getAttribute('src');

    if (src) {
      media.src = new URL(src, baseUrl).href;
    }
  }

  for (const x of Array.from(elm.querySelectorAll('video[data-poster]'))) {
    const video = x as HTMLVideoElement;
    const poster = video.getAttribute('data-poster');

    if (poster) {
      video.setAttribute('data-poster', new URL(poster, baseUrl).href);
    }
  }
};

export const navigateTo = async (url: URL, pushHistory = true): Promise<void> => {
  const htmlText = await fetch(url.pathname).then(r => r.text());

  const parser = new DOMParser();
  const parsed = parser.parseFromString(htmlText, 'text/html');

  const article = document.getElementById('article');
  const newArticle = parsed.querySelector('article');

  const newTitle = parsed.querySelector('title');

  if (!article || !newArticle || !newTitle) {
    console.error('article not found.');
    return;
  }

  setBaseUrl(newArticle, url);

  document.startViewTransition(() => {
    article.innerHTML = newArticle.innerHTML;
    document.title = newTitle.textContent;

    initialize();

    article.scrollIntoView({ behavior: 'instant' });
  });

  onNavigate?.(url);

  if (pushHistory) {
    history.pushState({ path: url.pathname, title: newTitle.textContent }, '', url.href);

    // deno-lint-ignore no-window
    window.dataLayer.push({
      event: 'page_view',
      page_path: url.pathname,
      page_title: newTitle.textContent,
    });
  }
};
