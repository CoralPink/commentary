import { ROOT_PATH } from './constants.ts';

import { fetchText } from './utils/fetch.ts';
import { setHTML } from './utils/html-sanitizer.ts';
import toast from './utils/toast.ts';

const PAGE_LIST = `${ROOT_PATH}pagelist.html`;

export default (() => {
  let isPageListLoadSuccess = false;

  return {
    async load(elm: HTMLElement): Promise<void> {
      if (isPageListLoadSuccess) {
        return;
      }

      elm.ariaBusy = 'true';

      try {
        setHTML(elm, await fetchText(PAGE_LIST));
        isPageListLoadSuccess = true;
      } catch (err: unknown) {
        setHTML(elm, 'Sorry!!');
        toast.error(`Failed to load pagelist - ${err}`);
      } finally {
        elm.ariaBusy = 'false';
      }
    },
  };
})();
