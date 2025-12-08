import { initCodeBlock } from './codeblock.ts';
import { ROOT_PATH } from './constants.ts';
import { initFootnote } from './footnote.ts';
import { initLinks } from './link.ts';
import { initMark } from './mark.ts';
import { initTableOfContents } from './table-of-contents.ts';

import * as ex from './extensions/types.ts';

import { initPulse, scheduleJob } from './utils/pulse.ts';

type HtmlJob = (html: HTMLElement) => void | Promise<void>;
/*
type Disposer = () => void;
type ExtensionInitializeFn = (html: HTMLElement) => () => void;

type InitializableExtension = {
  initialize?: ExtensionInitializeFn;
};

type ExtensionEntry = {
  importPromise: Promise<void>;
  initialize: ExtensionInitializeFn | undefined;
};
*/
const MODULE_REQUIREMENTS: { selector: string; module: string }[] = [
  { selector: '.slider', module: 'slider.js' },
  { selector: 'video', module: 'media.js' },
  // TODO: We will suspend use until a reliable method is found.
  // { selector: '.replace-element', module: 'replace-dom.js' },
];

const loadedExtensions = new Map<string, ex.ExtensionEntry>();
const activeDisposers = new Set<() => void>();

export const disposeAll = () => {
  for (const fn of activeDisposers) {
    fn();
  }
  activeDisposers.clear();
};

const regProcHtml =
  (fn: (html: HTMLElement) => ex.Disposer): HtmlJob =>
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
    .then((mod: ex.InitializableExtension) => {
      const maybeInit = mod.initialize;

      if (typeof maybeInit !== 'function') {
        loadedExtensions.set(url, { importPromise, initialize: undefined });
        return;
      }

      const initialize = maybeInit;

      regProcHtml(initialize)(html);
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
      ensureExtensionLoaded(html, `${ROOT_PATH}${req.module}`),
    ),
  );
};

const JOBS_INITIALIZE: HtmlJob[] = [
  regProcHtml(initTableOfContents),

  initMark,
  initLinks,
  initFootnote,

  regProcHtml(initCodeBlock),
  loadExternalExtensions,
];

export const initExtensions = (html: HTMLElement): void => {
  initPulse();

  for (const job of JOBS_INITIALIZE) {
    scheduleJob(() => job(html));
  }
};
