import { CONTENT_READY, ROOT_PATH } from './constants.ts';
import { initMark } from './mark.ts';
import { startupSearch } from './searcher.ts';
import { bootSidebar } from './sidebar.ts';
import { bootTableOfContents, initTableOfContents } from './table-of-contents.ts';

import type { Disposer, ExtensionEntry, InitializableExtension } from './extensions/types.ts';

import { prepareForNextCycle, scheduleJob } from './utils/pulse.ts';

type ModuleName = 'codeblock' | 'footnote' | 'footnote-legacy' | 'media' | 'slider';
type ModuleFactory = () => ModuleName;

type ModuleRequirement = {
  selector: string;
  module: ModuleName;
};

type HtmlJob = (html: HTMLElement) => void | Promise<void>;

const selectorModule = (selector: string, module: ModuleName | ModuleFactory): ModuleRequirement => ({
  selector,
  module: typeof module === 'function' ? module() : module,
});

const shouldUseLegacyFootnote = (): boolean => {
  const ua = navigator.userAgent;

  const isIOS = /iPhone|iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafariBrowser = ua.includes('Safari') && !ua.includes('Chrome');

  // iOS browsers, including Firefox and Chrome, use WebKit and require the legacy implementation.
  return isIOS || isSafariBrowser;
};

const useLegacyFootnote = shouldUseLegacyFootnote();
const footnoteModule = (): ModuleName => (useLegacyFootnote ? 'footnote-legacy' : 'footnote');

const MODULE_REQUIREMENTS = [
  selectorModule('.slider', 'slider'),
  selectorModule('video', 'media'),
  selectorModule('pre code:not(.language-txt)', 'codeblock'),

  selectorModule('sup', footnoteModule),
] satisfies readonly ModuleRequirement[];

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

const jobsInitialize = [
  loadExternalExtensions,

  regProcHtml(initTableOfContents),
  initMark,
] as const;

const disposeAll = (): void => {
  const snapshot: Array<Disposer> = Array.from(activeDisposers);
  activeDisposers.clear();

  for (const fn of snapshot) {
    scheduleJob(fn);
  }
};

const initExtensions = (html: HTMLElement): void => {
  for (const job of jobsInitialize) {
    scheduleJob(() => job(html));
  }
};

(() => {
  document.addEventListener(
    CONTENT_READY,
    (ev: Event): void => {
      const article = ev.target instanceof HTMLElement ? ev.target : null;

      if (article === null) {
        return;
      }
      prepareForNextCycle();

      disposeAll();
      initExtensions(article);
    },
    { passive: true },
  );

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      const article = document.getElementById('article');

      if (article === null) {
        console.error('Article element not found');
        return;
      }

      const jobsBoot: readonly HtmlJob[] = [bootSidebar, bootTableOfContents, startupSearch];

      for (const job of jobsBoot.concat(jobsInitialize)) {
        scheduleJob(() => job(article));
      }
    },
    { once: true, passive: true },
  );
})();
