import markjs from 'mark.js';
import { Fzf, extendedMatch } from 'fzf';

import wasmInit, { make_teaser } from './wasm_book.js';

// Search functionality
//
// You can use !hasFocus() to prevent keyhandling in your key
// event handlers while the user is typing their search.
const main = () => {
  const URL_SEARCH_PARAM = 'search';
  const URL_MARK_PARAM = 'highlight';

  const ELEMENT_BAR = document.getElementById('searchbar');
  const ELEMTNT_WRAPPER = document.getElementById('search-wrapper');
  const ELEMENT_RESULTS = document.getElementById('searchresults');
  const ELEMENT_ICON = document.getElementById('search-toggle');

  const PATH_TO_ROOT = document.getElementById('searcher').dataset.pathtoroot;

  let docUrls = [];

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

    if (ELEMENT_RESULTS.length == null) {
      return;
    }

    for (x of ELEMENT_RESULTS.children) {
      x => x.classList.remove('focus');
    }
  };

  const init = config => {
    const marker = new markjs(document.querySelector('.content main'));
    const mark_exclude = [];

    resultsOptions = config.results_options;
    searchOptions = config.search_options;
    docUrls = config.doc_urls;

    // Suppress "submit" events so thje page doesn't reload when the user presses Enter
    document.addEventListener('submit', e => e.preventDefault(), { once: false, passive: false });

    // Eventhandler for search icon
    ELEMENT_ICON.addEventListener(
      'mouseup',
      () => (ELEMTNT_WRAPPER.classList.contains('hidden') ? showSearch() : hiddenSearch()),
      { once: false, passive: true },
    );

    // Helper to parse a url into its building blocks.
    const parseURL = url => {
      const a = document.createElement('a');
      a.href = url;

      return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        params: (() => {
          const ret = {};
          a.search
            .replace(/^\?/, '')
            .split('&')
            .filter(x => {
              const s = x.split('=');
              ret[s[0]] = s[1];
            });
          return ret;
        })(),
        file: (a.pathname.match(/\/([^/?#]+)$/i) || [null, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^/])/, '/$1'),
      };
    };

    // Eventhandler for keyevents while the searchbar is focused
    const keyUpHandler = () => {
      // remove children
      while (ELEMENT_RESULTS.firstChild) {
        ELEMENT_RESULTS.removeChild(ELEMENT_RESULTS.firstChild);
      }

      // Update current url with ?URL_SEARCH_PARAM= parameter, remove ?URL_MARK_PARAM and #heading-anchor .
      const url = parseURL(window.location.href);
      delete url.params[URL_MARK_PARAM];

      const term = ELEMENT_BAR.value.trim();

      if (term === '') {
        ELEMENT_BAR.classList.remove('active');
        document.getElementById('searchresults-outer').classList.add('hidden');
        delete url.params[URL_SEARCH_PARAM];
        return;
      }

      url.params[URL_SEARCH_PARAM] = term;
      url.hash = '';

      ELEMENT_BAR.classList.add('active');

      const formatResult = (num, result) => {
        const url = docUrls[result.ref].split('#'); // The ?URL_MARK_PARAM= parameter belongs inbetween the page and the #heading-anchor

        if (url.length === 1) {
          url.push(''); // no anchor found
        }

        const terms = term.split(' ');
        const encUri = encodeURIComponent(terms.join(' ')).replace(/\'/g, '%27');

        const teaser = make_teaser(result.doc.body, terms);

        return (
          `<a href="${PATH_TO_ROOT}${url[0]}?${URL_MARK_PARAM}=${encUri}#${url[1]}" aria-details="teaser_${num}">${result.doc.breadcrumbs}</a>` +
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

      // Display results
      document.getElementById('searchresults-header').innerText =
        (results.length > count ? 'Over ' : '') + `${count} search results for: ${term}`;

      document.getElementById('searchresults-outer').classList.remove('hidden');
    };

    document.addEventListener(
      'keyup',
      e => {
        if (ELEMTNT_WRAPPER.classList.contains('hidden')) {
          if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            showSearch();
          }
          return;
        }

        if (e.key !== 'Escape') {
          keyUpHandler();
          return;
        }
        hiddenSearch();

        // hacky, but just focusing a div only works once
        const tmp = document.createElement('input');

        tmp.setAttribute('style', 'position: absolute; opacity: 0;');
        ELEMENT_ICON.appendChild(tmp);

        tmp.focus();
        tmp.remove();
      },
      { once: false, passive: true },
    );

    // On reload or browser history backwards/forwards events, parse the url and do search or mark
    const doSearchOrMarkFromUrl = () => {
      // Check current URL for search request
      const url = parseURL(window.location.href).params;

      if (!Object.prototype.hasOwnProperty.call(url, URL_MARK_PARAM)) {
        return;
      }
      ELEMENT_BAR.value = url[URL_MARK_PARAM];

      marker.mark(decodeURIComponent(url[URL_MARK_PARAM]).split(' '), {
        exclude: mark_exclude,
      });

      for (const x of document.querySelectorAll('mark')) {
        x.addEventListener('mousedown', marker.unmark, { once: true, passive: true });
      }
    };

    // If reloaded, do the search or mark again, depending on the current url parameters
    doSearchOrMarkFromUrl();
  };

  fetch(`${PATH_TO_ROOT}searchindex.json`)
    .then(response => response.json())
    .then(json => init(json))
    .catch(() => {
      console.log('Try to load searchindex.js if fetch failed');
      const script = document.createElement('script');
      script.src = `${PATH_TO_ROOT}searchindex.js`;
      script.onload = () => init(search);
      document.head.appendChild(script);
    });

  // Exported functions
  search.hasFocus = () => ELEMENT_BAR === document.activeElement;
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
      main();
    },
    { once: true, passive: true },
  );
})();
