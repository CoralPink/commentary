import { ROOT_PATH } from './constants.ts';
import { initMark } from './mark.ts';
import { startupSearch } from './searcher.ts';
import { bootSidebar } from './sidebar.ts';
import { bootTableOfContents, initTableOfContents } from './table-of-contents.ts';
import { bootThemeColor } from './theme-selector.ts';

import type { Disposer, ExtensionEntry, InitializableExtension } from './extensions/types.ts';

import { initPulse, scheduleJob } from './utils/pulse.ts';

type HtmlJob = (html: HTMLElement) => void | Promise<void>;

const MODULE_REQUIREMENTS = [
  { selector: '.slider', module: 'slider' },
  { selector: 'video', module: 'media' },
  { selector: 'pre code:not(.language-txt)', module: 'codeblock' },
  { selector: 'sup', module: 'footnote' },

  // TODO: We will suspend use until a reliable method is found.
  // { selector: '.replace-element', module: 'replace-dom.js' },
] as const;

const loadedExtensions = new Map<string, ExtensionEntry>();
const activeDisposers = new Set<Disposer>();

const regProcHtml =
  (fn: (html: HTMLElement) => Disposer): HtmlJob =>
  (html: HTMLElement): void => {
    activeDisposers.add(fn(html));
  };

const ensureExtensionLoaded = (html: HTMLElement, url: string): Promise<void> => {
  if (loadedExtensions.has(url)) {
    const entry = loadedExtensions.get(url)!;

    if (entry.initialize !== undefined) {
      regProcHtml(entry.initialize)(html);
    }
    return entry.importPromise;
  }

  const importPromise = import(url)
    .then((mod: InitializableExtension): void => {
      const initialize = mod.initialize;

      if (typeof initialize === 'function') {
        regProcHtml(initialize)(html);
      }
      loadedExtensions.set(url, { importPromise, initialize });
    })
    .catch(err => {
      console.error(`Failed to load module: ${url}`, err);
      loadedExtensions.delete(url);
    });

  return importPromise;
};

const loadExternalExtensions = async (html: HTMLElement): Promise<void> => {
  await Promise.all(
    MODULE_REQUIREMENTS.filter(req => html.querySelector(req.selector)).map(req =>
      ensureExtensionLoaded(html, `${ROOT_PATH}${req.module}.js`),
    ),
  );
};

const JOBS_INITIALIZE: readonly HtmlJob[] = [
  regProcHtml(initTableOfContents),

  initMark,
  loadExternalExtensions,
];

const disposeAll = () => {
  const snapshot: Array<Disposer> = Array.from(activeDisposers);
  activeDisposers.clear();

  for (const fn of snapshot) {
    scheduleJob(fn);
  }
};

export const initExtensions = (html: HTMLElement): void => {
  initPulse();
  disposeAll();

  for (const job of JOBS_INITIALIZE) {
    scheduleJob(() => job(html));
  }
};

(() => {
  const JOBS_BOOT: readonly HtmlJob[] = [bootThemeColor, bootSidebar, bootTableOfContents, startupSearch];

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      const article = document.getElementById('article');

      if (article === null) {
        console.error('Article element not found');
        return;
      }

      const jobs = JOBS_BOOT.concat(JOBS_INITIALIZE);

      for (const job of jobs) {
        scheduleJob(() => job(article));
      }
    },
    { once: true, passive: true },
  );
})();
