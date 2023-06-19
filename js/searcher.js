'use strict';

// Search functionality
//
// You can use !hasFocus() to prevent keyhandling in your key
// event handlers while the user is typing their search.
const main = search => {
  const URL_SEARCH_PARAM = 'search';
  const URL_MARK_PARAM = 'highlight';

  const ELEMENT_BAR = document.getElementById('searchbar');
  const ELEMTNT_WRAPPER = document.getElementById('search-wrapper');
  const ELEMENT_RESULTS = document.getElementById('searchresults');
  const ELEMENT_ICON = document.getElementById('search-toggle');

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

  const formatResult = (cnt, result, terms) => {
    const makeTeaser = (body, terms) => {
      const stemmed_terms = terms.map(w => elasticlunr.stemmer(w.toLowerCase()));
      const weighted = []; // contains elements of ["word", weight, index_in_document]
      const WEIGHT = 40;

      let value = 0;
      let idx = 0;
      let found = false;

      body
        .toLowerCase()
        .split('. ') // split in sentences, then words
        .forEach(x => {
          const words = x.split(' ');
          value = 8;

          words.forEach(y => {
            if (y.length > 0) {
              stemmed_terms.forEach(z => {
                if (elasticlunr.stemmer(y).startsWith(z)) {
                  value = WEIGHT;
                  found = true;
                }
              });
              weighted.push([y, value, idx]);
              value = 2;
            }
            idx += y.length;
            idx += 1; // ' ' or '.' if last word in sentence
          });

          idx += 1; // because we split at a two-char boundary '. '
        });

      if (weighted.length == 0) {
        return body;
      }

      const window_size = Math.min(weighted.length, resultsOptions.teaser_word_count);
      let cur_sum = 0;

      for (let wordindex = 0; wordindex < window_size; wordindex++) {
        cur_sum += weighted[wordindex][1];
      }

      const window_weight = [];
      window_weight.push(cur_sum);

      for (let wordindex = 0; wordindex < weighted.length - window_size; wordindex++) {
        cur_sum -= weighted[wordindex][1];
        cur_sum += weighted[wordindex + window_size][1];
        window_weight.push(cur_sum);
      }

      let max_sum_window_index = 0;

      if (found) {
        let max_sum = 0;

        // backwards
        for (let i = window_weight.length - 1; i >= 0; i--) {
          if (window_weight[i] > max_sum) {
            max_sum = window_weight[i];
            max_sum_window_index = i;
          }
        }
      } else {
        max_sum_window_index = 0;
      }

      const teaser = [];
      let index = weighted[max_sum_window_index][2];

      const pushTeaser = word => {
        index = word[2] + word[0].length;
        teaser.push(body.substring(word[2], index));
      };

      for (let i = max_sum_window_index; i < max_sum_window_index + window_size; i++) {
        const word = weighted[i];

        // missing text from index to start of `word`
        if (index < word[2]) {
          teaser.push(body.substring(index, word[2]));
          index = word[2];
        }

        if (word[1] != WEIGHT) {
          pushTeaser(word);
          continue;
        }
        teaser.push('<em>');
        pushTeaser(word);
        teaser.push('</em>');
      }
      return teaser.join('');
    };

    // The ?URL_MARK_PARAM= parameter belongs inbetween the page and the #heading-anchor
    const url = docUrls[result.ref].split('#');

    // no anchor found
    if (url.length == 1) {
      url.push('');
    }

    const num = cnt + 1;

    return (
      '<a href="' +
      document.getElementById('searcher').dataset.pathtoroot +
      url[0] +
      '?' +
      URL_MARK_PARAM +
      '=' +
      terms +
      '#' +
      url[1] +
      '" aria-details="teaser_' +
      num +
      '">' +
      result.doc.breadcrumbs +
      '</a>' +
      '<span class="teaser" id="teaser_' +
      num +
      '" aria-label="Search Result Teaser">' +
      makeTeaser(result.doc.body, terms) +
      '</span>'
    );
  };

  const showSearch = () => {
    ELEMTNT_WRAPPER.classList.remove('hidden');
    ELEMENT_ICON.setAttribute('aria-expanded', 'true');
  };

  const hiddenSearch = () => {
    ELEMTNT_WRAPPER.classList.add('hidden');
    ELEMENT_ICON.setAttribute('aria-expanded', 'false');

    if (ELEMENT_RESULTS.length == null) {
      return;
    }
    ELEMENT_RESULTS.children.forEach(x => x.classList.remove('focus'));
  };

  const init = config => {
    const marker = new Mark(document.querySelector('main'));
    const mark_exclude = [];

    resultsOptions = config.results_options;
    searchOptions = config.search_options;
    docUrls = config.doc_urls;

    // Eventhandler for search icon
    ELEMENT_ICON.addEventListener(
      'click',
      () => {
        if (ELEMTNT_WRAPPER.classList.contains('hidden')) {
          showSearch();
          window.scrollTo(0, 0);
          ELEMENT_BAR.select();
        } else {
          hiddenSearch();
        }
      },
      { once: false, passive: true }
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
          const seg = a.search.replace(/^\?/, '').split('&');
          let i = 0;

          for (; i < seg.length; i++) {
            if (!seg[i]) {
              continue;
            }
            const s = seg[i].split('=');
            ret[s[0]] = s[1];
          }
          return ret;
        })(),
        file: (a.pathname.match(/\/([^/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^/])/, '/$1'),
      };
    };

    // Eventhandler for keyevents while the searchbar is focused
    const keyUpHandler = () => {
      const removeChildren = elem => {
        while (elem.firstChild) {
          elem.removeChild(elem.firstChild);
        }
      };

      const doSearch = term => {
        removeChildren(ELEMENT_RESULTS);

        // Do the actual search
        const results = elasticlunr.Index.load(config.index).search(term, searchOptions);
        const count = Math.min(results.length, resultsOptions.limit_results);

        document.getElementById('searchresults-header').innerText =
          (results.length > count ? 'Over ' : '') + count + ' search results for: ' + term;

        const terms = term.split(' ');

        for (let i = 0; i < count; i++) {
          const resultElem = document.createElement('li');
          resultElem.innerHTML = formatResult(i, results[i], terms);

          ELEMENT_RESULTS.appendChild(resultElem);
        }

        // Display results
        document.getElementById('searchresults-outer').classList.remove('hidden');
      };

      const term = ELEMENT_BAR.value.trim();

      if (term != '') {
        ELEMENT_BAR.classList.add('active');
        doSearch(term);
      } else {
        ELEMENT_BAR.classList.remove('active');
        document.getElementById('searchresults-outer').classList.add('hidden');
        removeChildren(ELEMENT_RESULTS);
      }
      marker.unmark();

      // Update current url with ?URL_SEARCH_PARAM= parameter, remove ?URL_MARK_PARAM and #heading-anchor .
      const url = parseURL(window.location.href);

      delete url.params[URL_MARK_PARAM];

      if (term == '') {
        delete url.params[URL_SEARCH_PARAM];
        return;
      }
      url.params[URL_SEARCH_PARAM] = term;
      url.hash = '';
    };

    document.addEventListener(
      'keyup',
      e => {
        if (e.key != 'Escape') {
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
      { once: false, passive: true }
    );

    // On reload or browser history backwards/forwards events, parse the url and do search or mark
    const doSearchOrMarkFromUrl = () => {
      // Check current URL for search request
      const url = parseURL(window.location.href);

      if (url.params.hasOwnProperty.call(URL_SEARCH_PARAM) && url.params[URL_SEARCH_PARAM] != '') {
        showSearch();

        ELEMENT_BAR.value = decodeURIComponent((url.params[URL_SEARCH_PARAM] + '').replace(/\+/g, '%20'));

        keyUpHandler();
      } else {
        hiddenSearch();
      }

      if (!url.params.hasOwnProperty(URL_MARK_PARAM)) {
        return;
      }

      marker.mark(decodeURIComponent(url.params[URL_MARK_PARAM]).split(' '), {
        exclude: mark_exclude,
      });

      document.querySelectorAll('mark').forEach(x => {
        x.addEventListener('click', marker.unmark, { once: true, passive: true });
      });
    };

    // If the user uses the browser buttons, do the same as if a reload happened
    window.onpopstate = () => doSearchOrMarkFromUrl();

    // Suppress "submit" events so thje page doesn't reload when the user presses Enter
    document.addEventListener(
      'submit',
      e => {
        e.preventDefault();
      },
      { once: false, passive: false }
    );

    // If reloaded, do the search or mark again, depending on the current url parameters
    doSearchOrMarkFromUrl();
  };

  const load = document.getElementById('searcher').dataset.pathtoroot + 'searchindex';

  fetch(load + '.json')
    .then(response => response.json())
    .then(json => init(json))
    .catch(() => {
      console.log('Try to load searchindex.js if fetch failed');
      const script = document.createElement('script');
      script.src = load + '.js';
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
  window.elasticlunr.Index.load = index => {
    const FzF = window.fzf.Fzf;
    const storeDocs = index.documentStore.docs;
    const indexArr = Object.keys(storeDocs);
    const ofzf = new FzF(indexArr, {
      selector: item => {
        const res = storeDocs[item];
        res.text = `${res.title}${res.breadcrumbs}${res.body}`;
        return res.text;
      },
    });
    return {
      search: searchterm => {
        const entries = ofzf.find(searchterm);
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
  if (!Mark || !elasticlunr) {
    return;
  }
  window.search = window.search || {};

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      fzfInit();
      main(window.search);
    },
    { once: true, passive: true }
  );
})();
