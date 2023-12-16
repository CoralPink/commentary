import markjs from 'mark.js';
import { Fzf, extendedMatch } from 'fzf';

import wasmInit, { SearchResult } from './wasm_book.js';

const ELEM_BAR = document.getElementById('searchbar');
const ELEM_WRAPPER = document.getElementById('search-wrapper');
const ELEM_RESULTS = document.getElementById('searchresults');
const ELEM_ICON = document.getElementById('search-toggle');

const ELEM_HEADER = document.getElementById('searchresults-header');
const ELEM_OUTER = document.getElementById('searchresults-outer');

const PATH_TO_ROOT = document.getElementById('searcher').dataset.pathtoroot;
const resultMarker = new markjs(ELEM_RESULTS);

let searchResult;
let fzf;

let storeDocs;

// Eventhandler for keyevents while the searchbar is focused
const keyUpHandler = () => {
  const term = ELEM_BAR.value.trim();

  if (term === '') {
    ELEM_OUTER.classList.add('hidden');
    return;
  }

  const results = fzf.find(term).map(data => {
    return {
      doc: storeDocs[data.item],
      ref: data.item,
      score: data.score,
    };
  });

  ELEM_RESULTS.innerHTML = '';
  ELEM_HEADER.innerText = `${results.length} search results for : ${term}`;

  for (const result of results) {
    searchResult.append_search_result(result.ref, result.doc.body, result.doc.breadcrumbs, term);
  }

  resultMarker.mark(decodeURIComponent(term).split(' '), {
    accuracy: 'complementary',
    exclude: ['a'],
  });

  ELEM_OUTER.classList.remove('hidden');
};

const showSearch = () => {
  ELEM_WRAPPER.classList.remove('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'true');
  ELEM_BAR.select();
};

const hiddenSearch = () => {
  ELEM_WRAPPER.classList.add('hidden');
  ELEM_ICON.setAttribute('aria-expanded', 'false');
};

// On reload or browser history backwards/forwards events, parse the url and do search or mark
const doSearchOrMarkFromUrl = () => {
  const param = new URLSearchParams(globalThis.location.search).get('highlight');

  if (!param) {
    return;
  }
  const term = decodeURIComponent(param);
  ELEM_BAR.value = term;

  const marker = new markjs(document.getElementById('main'));
  marker.mark(term.split(' '), {
    accuracy: 'complementary',
  });

  for (const x of document.querySelectorAll('mark')) {
    x.addEventListener('mousedown', marker.unmark, { once: true, passive: true });
  }
};

const initialize = async () => {
  try {
    const [config, _] = await Promise.all([
      fetch(`${PATH_TO_ROOT}searchindex.json`).then(response => response.json()),
      wasmInit(),
    ]);

    searchResult = new SearchResult(PATH_TO_ROOT, config.results_options.teaser_word_count, config.doc_urls);
    storeDocs = config.index.documentStore.docs;

    /** @see https://github.com/HillLiu/docker-mdbook */
    fzf = new Fzf(Object.keys(storeDocs), {
      limit: config.results_options.limit_results,
      selector: item => {
        const res = storeDocs[item];
        res.text = `${res.title}${res.breadcrumbs}${res.body}`;
        return res.text;
      },
      tiebreakers: [
        (a, b, selector) => {
          return selector(a.item).trim().length - selector(b.item).trim().length;
        },
      ],
      match: extendedMatch,
    });
  } catch (e) {
    console.error(`Error during initialization: ${e}`);
    console.log('The search function is disabled.');
    ELEM_ICON.classList.add('hidden');
    return;
  }

  ELEM_BAR.addEventListener('keyup', keyUpHandler, { once: false, passive: true });
  ELEM_ICON.addEventListener(
    'mouseup',
    () => (ELEM_WRAPPER.classList.contains('hidden') ? showSearch() : hiddenSearch()),
    { once: false, passive: true },
  );

  document.addEventListener(
    'keyup',
    e => {
      if (ELEM_WRAPPER.classList.contains('hidden')) {
        switch (e.key) {
          case '/':
          case 's':
          case 'S':
            showSearch();
            break;
        }
        return;
      }

      if (e.key === 'Escape') {
        hiddenSearch();
      }
    },
    { once: false, passive: true },
  );

  // Suppress "submit" events so thje page doesn't reload when the user presses Enter
  document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });
};

(() => {
  // Exported functions
  globalThis.search = globalThis.search || {};
  globalThis.search.hasFocus = () => ELEM_BAR === document.activeElement;

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      doSearchOrMarkFromUrl();
      initialize();
    },
    { once: true, passive: true },
  );
})();
