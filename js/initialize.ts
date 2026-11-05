import { CONTENT_READY, ROOT_PATH } from './constants.ts';
import { initMark } from './mark.ts';
import { hiddenSearch, startupSearch } from './searcher.ts';
import { bootSidebar } from './sidebar.ts';
import { bootTableOfContents, initTableOfContents } from './table-of-contents.ts';

import { ELEMENT_MEDIA_SLIDER, ELEMENT_YOUTUBE } from './extensions/element.ts';
import type { Disposer, InitializableExtension } from './extensions/types.ts';

import { isWebkitBased } from './utils/platform.ts';
import { isCurrentCycle, prepareForNextCycle, scheduleJob } from './utils/pulse.ts';

type ModuleName = 'codeblock' | 'footnote' | 'footnote-legacy' | 'media-slider' | 'video' | 'youtube';
type ModuleFactory = () => ModuleName;

type ModuleRequirement = {
  selector: string;
  module: ModuleName;
};

type HtmlJob = (html: HTMLElement, cycle: number) => void | Promise<void>;

const selectorModule = (selector: string, module: ModuleName | ModuleFactory): ModuleRequirement => ({
  selector,
  module: typeof module === 'function' ? module() : module,
});

const footnoteModule = isWebkitBased() ? 'footnote-legacy' : 'footnote';

const MODULE_REQUIREMENTS = [
  selectorModule(ELEMENT_MEDIA_SLIDER, 'media-slider'),
  selectorModule(ELEMENT_YOUTUBE, 'youtube'),
  selectorModule('pre code:not(.language-txt)', 'codeblock'),
  selectorModule('video', 'video'),
  selectorModule('sup', footnoteModule),
] satisfies readonly ModuleRequirement[];

const activeDisposers = new Set<Disposer>();

const regProcHtml =
  (fn: (html: HTMLElement) => Disposer): HtmlJob =>
  (html: HTMLElement): void => {
    activeDisposers.add(fn(html));
  };

const loadedExtensions = new Map<string, Promise<((html: HTMLElement) => Disposer) | undefined>>();

const loadExtension = (url: string): Promise<((html: HTMLElement) => Disposer) | undefined> => {
  let promise = loadedExtensions.get(url);

  if (promise !== undefined) {
    return promise;
  }

  promise = import(url)
    .then((mod: InitializableExtension) => (typeof mod.initialize === 'function' ? mod.initialize : undefined))
    .catch((error: unknown) => {
      console.error(`Failed to load module: ${url}`, error);
      loadedExtensions.delete(url);
      return undefined;
    });

  loadedExtensions.set(url, promise);

  return promise;
};

const initializeExternalExtensions = async (html: HTMLElement, expectedCycle: number): Promise<void> => {
  const requirements = MODULE_REQUIREMENTS.filter(requirement => html.querySelector(requirement.selector));

  const extensions = await Promise.all(
    requirements.map(async requirement => {
      const url = `${ROOT_PATH}${requirement.module}.js`;
      return loadExtension(url);
    }),
  );

  if (!isCurrentCycle(expectedCycle) || !html.isConnected) {
    return;
  }

  for (const initialize of extensions) {
    if (!initialize || !isCurrentCycle(expectedCycle) || !html.isConnected) {
      continue;
    }

    const disposer = initialize(html);
    isCurrentCycle(expectedCycle) && html.isConnected ? activeDisposers.add(disposer) : disposer();
  }
};

const disposeAll = (): void => {
  const snapshot = Array.from(activeDisposers);
  activeDisposers.clear();

  for (const dispose of snapshot) {
    try {
      dispose();
    } catch (error: unknown) {
      console.error('dispose: disposer threw an error', error);
    }
  }
};

const setSchedule = (html: HTMLElement, jobs: readonly HtmlJob[]): void => {
  const currentCycle = prepareForNextCycle();
  disposeAll();

  for (const job of jobs) {
    scheduleJob(() => {
      void Promise.resolve(job(html, currentCycle)).catch((error: unknown) => {
        console.error('Scheduled HTML job failed', error);
      });
    });
  }
};

(() => {
  void navigator.serviceWorker
    ?.register(`${ROOT_PATH}serviceworker.js`, {
      scope: ROOT_PATH,
      type: 'module',
    })
    .catch((error: unknown) => {
      console.error(`Registration failed: ${error}`);
    });

  document.addEventListener(
    CONTENT_READY,
    (ev: Event): void => {
      const article = ev.target instanceof HTMLElement ? ev.target : null;

      if (article === null) {
        console.error('Target not found');
        return;
      }

      setSchedule(article, [regProcHtml(initTableOfContents), initializeExternalExtensions, initMark, hiddenSearch]);
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

      setSchedule(article, [
        bootSidebar,
        bootTableOfContents,
        regProcHtml(initTableOfContents),
        initializeExternalExtensions,
        initMark,
        startupSearch,
      ]);
    },
    { once: true, passive: true },
  );
})();
