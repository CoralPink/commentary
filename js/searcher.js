import markjs from 'mark.js';
import { Fzf, extendedMatch } from 'fzf';

import wasmInit, { make_teaser } from './wasm_book.js';

const searchMain = () => {
  const PARAM_HIGHLIGHT = 'highlight';

  const ELEM_BAR = document.getElementById('searchbar');
  const ELEM_WRAPPER = document.getElementById('search-wrapper');
  const ELEM_RESULTS = document.getElementById('searchresults');
  const ELEM_ICON = document.getElementById('search-toggle');

  const ELEM_HEADER = document.getElementById('searchresults-header');
  const ELEM_OUTER = document.getElementById('searchresults-outer');

  const PATH_TO_ROOT = document.getElementById('searcher').dataset.pathtoroot;

  const resultMarker = new markjs(ELEM_OUTER);

  let searchConfig = {};

  // Exported functions
  window.search.hasFocus = () => ELEM_BAR === document.activeElement;

  // Eventhandler for keyevents while the searchbar is focused
  const keyUpHandler = () => {
    // remove children
    while (ELEM_RESULTS.firstChild) {
      ELEM_RESULTS.removeChild(ELEM_RESULTS.firstChild);
    }

    const term = ELEM_BAR.value.trim();

    if (term === '') {
      ELEM_OUTER.classList.add('hidden');
      return;
    }

    const formatResult = result => {
      const url = searchConfig.doc_urls[result.ref].split('#');

      if (url.length === 1) {
        url.push(''); // no anchor found
      }

      const terms = term.split(' ');
      const encUri = encodeURIComponent(terms.join(' ')).replace(/\'/g, '%27');

      const teaser = make_teaser(result.doc.body, terms, searchConfig.results_options.teaser_word_count);

      return (
        `<a href="${PATH_TO_ROOT}${url[0]}?${PARAM_HIGHLIGHT}=${encUri}#${url[1]}">${result.doc.breadcrumbs}</a>` +
        `<span class="teaser" aria-label="Search Result Teaser">${teaser}</span>`
      );
    };

    // Do the actual search
    const results = elasticlunr.Index.load(searchConfig.index).search(term, searchConfig.search_options);
    const count = Math.min(results.length, searchConfig.results_options.limit_results);

    for (let i = 0; i < count; i++) {
      const resultElem = document.createElement('li');
      resultElem.innerHTML = formatResult(results[i]);

      ELEM_RESULTS.appendChild(resultElem);
    }

    resultMarker.mark(decodeURIComponent(term).split(' '), {
      accuracy: 'complementary',
      exclude: ['a'],
    });

    // Display results
    ELEM_HEADER.innerText = (results.length > count ? 'Over ' : '') + `${count} search results for: ${term}`;
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

  const initialize = config => {
    searchConfig = Object.assign({}, config);

    // Suppress "submit" events so thje page doesn't reload when the user presses Enter
    document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });

    // On reload or browser history backwards/forwards events, parse the url and do search or mark
    const doSearchOrMarkFromUrl = () => {
      const search = new URL(window.location.href).search;

      if (!search) {
        return;
      }

      const params = {};

      for (const pair of search.replace(/^\?/, '').split('&')) {
        const [key, value] = pair.split('=');

        if (key) {
          params[key] = value;
        }
      }

      if (!Object.hasOwn(params, PARAM_HIGHLIGHT)) {
        return;
      }

      const term = decodeURIComponent(params[PARAM_HIGHLIGHT]);

      if (term === undefined) {
        return;
      }
      ELEM_BAR.value = term;

      const marker = new markjs(document.querySelector('.content main'));
      marker.mark(decodeURIComponent(term).split(' '), {
        accuracy: 'complementary',
      });

      for (const x of document.querySelectorAll('mark')) {
        x.addEventListener('mousedown', marker.unmark, { once: true, passive: true });
      }
    };

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
              e.preventDefault();
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
  if (!elasticlunr) {
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
