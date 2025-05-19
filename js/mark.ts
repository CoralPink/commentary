import { marking, unmarking } from './wasm_book';

export const unmarkHandler = (): void => {
  const article = document.getElementById('article');

  if (article === null) {
    console.error('Article element not found');
    return;
  }

  for (const x of Array.from(article.querySelectorAll('mark'))) {
    x.removeEventListener('click', unmarkHandler);
  }
  unmarking(article);
};

// On reload or browser history backwards/forwards events, parse the url and do search or mark
export const doSearchOrMarkFromUrl = (): void => {
  const params = new URLSearchParams(globalThis.location.search).get('mark');

  if (!params) {
    return;
  }

  const article = document.getElementById('article');

  if (article === null) {
    console.error('Article element not found');
    return;
  }

  marking(article, params);

  for (const x of Array.from(article.querySelectorAll('mark'))) {
    x.addEventListener('click', unmarkHandler, { once: true, passive: true });
  }
};
