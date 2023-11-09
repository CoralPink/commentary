import markjs from 'mark.js';
import { Fzf, extendedMatch } from 'fzf';

import wasmInit, { make_teaser } from './wasm_book.js';

const searchMain = () => {
  const PARAM_HIGHLIGHT = 'highlight';

  const ELEMENT_BAR = document.getElementById('searchbar');
  const ELEMTNT_WRAPPER = document.getElementById('search-wrapper');
  const ELEMENT_RESULTS = document.getElementById('searchresults');
  const ELEMENT_ICON = document.getElementById('search-toggle');

  const PATH_TO_ROOT = document.getElementById('searcher').dataset.pathtoroot;

  // Exported functions
  window.search.hasFocus = () => ELEMENT_BAR === document.activeElement;

  let resultsOptions = {
    teaser_word_count: 30,
    limit_results: 30,
  };

  let searchOptions = {
    bool: 'AND',
    expand: true,
    fields: {
      title: { boost: 1 },
      body: { boost: 1 },
      breadcrumbs: { boost: 0 },
    },
  };

  const showSearch = () => {
    ELEMTNT_WRAPPER.classList.remove('hidden');
    ELEMENT_ICON.setAttribute('aria-expanded', 'true');
    ELEMENT_BAR.select();
  };

  const hiddenSearch = () => {
    ELEMTNT_WRAPPER.classList.add('hidden');
    ELEMENT_ICON.setAttribute('aria-expanded', 'false');
  };

  const init = config => {
    resultsOptions = config.results_options;
    searchOptions = config.search_options;

    // Suppress "submit" events so thje page doesn't reload when the user presses Enter
    document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });

    // Eventhandler for search icon
    ELEMENT_ICON.addEventListener(
      'mouseup',
      () => (ELEMTNT_WRAPPER.classList.contains('hidden') ? showSearch() : hiddenSearch()),
      { once: false, passive: true },
    );

    // Eventhandler for keyevents while the searchbar is focused
    const keyUpHandler = () => {
      // remove children
      while (ELEMENT_RESULTS.firstChild) {
        ELEMENT_RESULTS.removeChild(ELEMENT_RESULTS.firstChild);
      }

      const term = ELEMENT_BAR.value.trim();

      if (term === '') {
        document.getElementById('searchresults-outer').classList.add('hidden');
        return;
      }

      const formatResult = (num, result) => {
        const url = config.doc_urls[result.ref].split('#'); // The ?PARAM_HIGHLIGHT= parameter belongs inbetween the page and the #heading-anchor

        if (url.length === 1) {
          url.push(''); // no anchor found
        }

        const terms = term.split(' ');
        const encUri = encodeURIComponent(terms.join(' ')).replace(/\'/g, '%27');

        const teaser = make_teaser(result.doc.body, terms);

        return (
          `<a href="${PATH_TO_ROOT}${url[0]}?${PARAM_HIGHLIGHT}=${encUri}#${url[1]}" aria-details="teaser_${num}">${result.doc.breadcrumbs}</a>` +
          `<span class="teaser" id="teaser_${num}" aria-label="Search Result Teaser">${teaser}</span>`
        );
      };

      // Do the actual search
      const results = elasticlunr.Index.load(config.index).search(term, searchOptions);
      const count = Math.min(results.length, resultsOptions.limit_results);

      for (let i = 0; i < count; i++) {
        const resultElem = document.createElement('li');
        resultElem.innerHTML = formatResult(i + 1, results[i]);

        ELEMENT_RESULTS.appendChild(resultElem);
      }

      const marker = new markjs(document.getElementById('searchresults-outer'));
      marker.mark(decodeURIComponent(term).split(' '), {
        accuracy: 'complementary',
        exclude: ['a'],
      });

      // Display results
      document.getElementById('searchresults-header').innerText =
        (results.length > count ? 'Over ' : '') + `${count} search results for: ${term}`;

      document.getElementById('searchresults-outer').classList.remove('hidden');
    };

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
      ELEMENT_BAR.value = term;

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

    document.addEventListener(
      'keyup',
      e => {
        if (ELEMTNT_WRAPPER.classList.contains('hidden')) {
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

        e.key !== 'Escape' ? keyUpHandler() : hiddenSearch();
      },
      { once: false, passive: true },
    );
  };

  fetch(`${PATH_TO_ROOT}searchindex.json`)
    .then(response => response.json())
    .then(json => init(json))
    .catch(() => {
      console.log('Try to load searchindex.js if fetch failed');
      const script = document.createElement('script');
      script.src = `${PATH_TO_ROOT}searchindex.js`;
      script.onload = () => init(window.search);
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
