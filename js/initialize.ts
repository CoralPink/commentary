import { registryCodeBlock } from './codeblock.ts';
import { ROOT_PATH } from './constants.ts';
import { initFootnote } from './footnote.ts';
import { enhanceLinks } from './link.ts';
import { doMarkFromUrl } from './mark.ts';
import { registryToc } from './table-of-contents.ts';

import { scheduleJob } from './utils/pulse.ts';

type HtmlJob = (html: HTMLElement) => void | Promise<void>;

type Disposer = () => void;
type ModuleInitializeFn = (html: HTMLElement) => () => void;

type InitializableModule = {
  initialize?: ModuleInitializeFn;
};

type ModuleEntry = {
  importPromise: Promise<void>;
  initialize: ModuleInitializeFn | undefined;
};

const MODULE_REQUIREMENTS: { selector: string; module: string }[] = [
  { selector: '.slider', module: 'slider.js' },
  { selector: 'video', module: 'media.js' },
  // TODO: We will suspend use until a reliable method is found.
  // { selector: '.replace-element', module: 'replace-dom.js' },
];

const loadedModules = new Map<string, ModuleEntry>();
const activeDisposers = new Set<() => void>();

export const disposeAll = () => {
  for (const fn of activeDisposers) {
    fn();
  }
  activeDisposers.clear();
};

const initializeProcHtml =
  (fn: (html: HTMLElement) => Disposer): HtmlJob =>
  (html: HTMLElement): void => {
    activeDisposers.add(fn(html));
  };

const ensureExternalModuleLoaded = (html: HTMLElement, url: string): Promise<void> => {
  if (loadedModules.has(url)) {
    const entry = loadedModules.get(url)!;

    if (entry.initialize !== undefined) {
      initializeProcHtml(entry.initialize)(html);
    }
    return entry.importPromise;
  }

  const importPromise = import(url)
    .then((mod: InitializableModule) => {
      const maybeInit = mod.initialize;

      if (typeof maybeInit !== 'function') {
        loadedModules.set(url, { importPromise, initialize: undefined });
        return;
      }

      const initialize = maybeInit; // 型は ModuleInitializeFn

      initializeProcHtml(initialize)(html);
      loadedModules.set(url, { importPromise, initialize });
    })
    .catch(err => {
      console.error(`Failed to load module: ${url}`, err);
      loadedModules.delete(url);
    });

  return importPromise;
};

const loadExternalModules = async (html: HTMLElement): Promise<void> => {
  await Promise.all(
    MODULE_REQUIREMENTS.filter(req => html.querySelector(req.selector)).map(req =>
      ensureExternalModuleLoaded(html, `${ROOT_PATH}${req.module}`),
    ),
  );
};

const JOBS_INITIALIZE: HtmlJob[] = [
  doMarkFromUrl,
  enhanceLinks,
  initFootnote,

  initializeProcHtml(registryToc),
  initializeProcHtml(registryCodeBlock),

  loadExternalModules,
];

export const initModules = (html: HTMLElement): void => {
  for (const job of JOBS_INITIALIZE) {
    scheduleJob(() => job(html));
  }
};
