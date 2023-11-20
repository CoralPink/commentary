import markjs from 'mark.js';
import { Fzf, extendedMatch } from 'fzf';

import wasmInit, { create_search_results_list } from './wasm_book.js';

const searchMain = () => {
  const ELEM_BAR = document.getElementById('searchbar');
  const ELEM_WRAPPER = document.getElementById('search-wrapper');
  const ELEM_RESULTS = document.getElementById('searchresults');
  const ELEM_ICON = document.getElementById('search-toggle');

  const ELEM_HEADER = document.getElementById('searchresults-header');
  const ELEM_OUTER = document.getElementById('searchresults-outer');

  const PATH_TO_ROOT = document.getElementById('searcher').dataset.pathtoroot;

  const resultMarker = new markjs(ELEM_RESULTS);

  let searchConfig = {};
  let lunrIndex;

  // Exported functions
  window.search.hasFocus = () => ELEM_BAR === document.activeElement;

  const getResults = term => {
    const results = lunrIndex.search(term, searchConfig.search_options);
    const count = Math.min(results.length, searchConfig.results_options.limit_results);

    ELEM_HEADER.innerText = (results.length > count ? 'Over ' : '') + `${count} search results for: ${term}`;
    return results.slice(count);
  };

  // Eventhandler for keyevents while the searchbar is focused
  const keyUpHandler = () => {
    const term = ELEM_BAR.value.trim();

    if (term === '') {
      ELEM_OUTER.classList.add('hidden');
      return;
    }

    ELEM_RESULTS.innerHTML = '';

    for (const result of getResults(term)) {
      create_search_results_list(
        PATH_TO_ROOT,
        searchConfig.doc_urls[result.ref],
        result.doc.body,
        result.doc.breadcrumbs,
        term,
        searchConfig.results_options.teaser_word_count,
      );
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
    const param = new URLSearchParams(window.location.search).get('highlight');

    if (!param) {
      return;
    }
    const term = decodeURIComponent(param);
    ELEM_BAR.value = term;

    const marker = new markjs(document.querySelector('.content main'));
    marker.mark(term.split(' '), {
      accuracy: 'complementary',
    });

    for (const x of document.querySelectorAll('mark')) {
      x.addEventListener('mousedown', marker.unmark, { once: true, passive: true });
    }
  };

  const initialize = config => {
    searchConfig = Object.assign({}, config);
    lunrIndex = window.elasticlunr.Index.load(searchConfig.index);

    // Suppress "submit" events so thje page doesn't reload when the user presses Enter
    document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });

    // If reloaded, do the search or mark again, depending on the current url parameters
    doSearchOrMarkFromUrl();

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

    searchbar.addEventListener('keyup', keyUpHandler, { once: false, passive: true });
  };

  fetch(`${PATH_TO_ROOT}searchindex.json`)
    .then(response => response.json())
    .then(json => initialize(json))
    .catch(() => {
      console.log('Try to load searchindex.js if fetch failed');
      const script = document.createElement('script');
      script.src = `${PATH_TO_ROOT}searchindex.js`;
      script.onload = () => initialize(window.search);
      document.head.appendChild(script);
    });
};

/**
 * @see https://github.com/HillLiu/docker-mdbook
 */
const fzfInit = () => {
  const byTrimmedLengthAsc = (a, b, selector) => {
    return selector(a.item).trim().length - selector(b.item).trim().length;
  };

  window.elasticlunr.Index.load = index => {
    const storeDocs = index.documentStore.docs;

    const fzf = new Fzf(Object.keys(storeDocs), {
      match: extendedMatch,
      selector: item => {
        const res = storeDocs[item];
        res.text = `${res.title}${res.breadcrumbs}${res.body}`;
        return res.text;
      },
      tiebreakers: [byTrimmedLengthAsc],
    });

    return {
      search: searchterm => {
        const entries = fzf.find(searchterm);
        return entries.map(data => {
          const { item, score } = data;
          return {
            doc: storeDocs[item],
            ref: item,
            score,
          };
        });
      },
    };
  };
};

(() => {
  if (!window.elasticlunr) {
    return;
  }
  window.search = window.search || {};

  wasmInit();

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      fzfInit();
      searchMain();
    },
    { once: true, passive: true },
  );
})();
