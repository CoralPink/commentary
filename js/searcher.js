'use strict';

// Search functionality
//
// You can use !hasFocus() to prevent keyhandling in your key
// event handlers while the user is typing their search.
const main = search => {
  const URL_SEARCH_PARAM = 'search';
  const URL_MARK_PARAM = 'highlight';

  const search_wrap = document.getElementById('search-wrapper');
  const searchbar = document.getElementById('searchbar');
  const searchresults = document.getElementById('searchresults');
  const searchicon = document.getElementById('search-toggle');

  let doc_urls = [];

  let results_options = {
    teaser_word_count: 30,
    limit_results: 30,
  };

  let search_options = {
    bool: 'AND',
    expand: true,
    fields: {
      title: { boost: 1 },
      body: { boost: 1 },
      breadcrumbs: { boost: 0 },
    },
  };

  let teaser_count = 0;

  const removeChildren = elem => {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  };

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

  // Helper to escape html special chars for displaying the teasers
  const escapeHTML = (() => {
    const MAP = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&#34;',
      "'": '&#39;',
    };

    const repl = c => {
      return MAP[c];
    };

    return s => {
      return s.replace(/[&<>'"]/g, repl);
    };
  })();

  const formatSearchResult = (result, searchterms) => {
    const teaser = makeTeaser(escapeHTML(result.doc.body), searchterms);
    teaser_count++;

    // The ?URL_MARK_PARAM= parameter belongs inbetween the page and the #heading-anchor
    const url = doc_urls[result.ref].split('#');

    if (url.length == 1) {
      // no anchor found
      url.push('');
    }

    // encodeURIComponent escapes all chars that could allow an XSS except
    // for '. Due to that we also manually replace ' with its url-encoded
    // representation (%27).
    const st = encodeURIComponent(searchterms.join(' ')).replace(/\'/g, '%27');

    return (
      '<a href="' +
      document.getElementById('searcher').dataset.pathtoroot +
      url[0] +
      '?' +
      URL_MARK_PARAM +
      '=' +
      st +
      '#' +
      url[1] +
      '" aria-details="teaser_' +
      teaser_count +
      '">' +
      result.doc.breadcrumbs +
      '</a>' +
      '<span class="teaser" id="teaser_' +
      teaser_count +
      '" aria-label="Search Result Teaser">' +
      teaser +
      '</span>'
    );
  };

  const makeTeaser = (body, searchterms) => {
    // The strategy is as follows:
    // First, assign a value to each word in the document:
    //  Words that correspond to search terms (stemmer aware): 40
    //  Normal words: 2
    //  First word in a sentence: 8
    // Then use a sliding window with a constant number of words and count the
    // sum of the values of the words within the window. Then use the window that got the
    // maximum sum. If there are multiple maximas, then get the last one.
    // Enclose the terms in <em>.
    const stemmed_searchterms = searchterms.map(function (w) {
      return elasticlunr.stemmer(w.toLowerCase());
    });
    const searchterm_weight = 40;

    let idx = 0;
    let value = 0;
    let searchterm_found = false;

    const weighted = []; // contains elements of ["word", weight, index_in_document]

    body
      .toLowerCase()
      .split('. ') // split in sentences, then words
      .forEach(x => {
        const words = x.split(' ');
        value = 8;

        words.forEach(y => {
          if (y.length > 0) {
            stemmed_searchterms.forEach(z => {
              if (elasticlunr.stemmer(y).startsWith(z)) {
                value = searchterm_weight;
                searchterm_found = true;
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

    const window_weight = [];
    const window_size = Math.min(weighted.length, results_options.teaser_word_count);

    let cur_sum = 0;

    for (let wordindex = 0; wordindex < window_size; wordindex++) {
      cur_sum += weighted[wordindex][1];
    }
    window_weight.push(cur_sum);

    for (let wordindex = 0; wordindex < weighted.length - window_size; wordindex++) {
      cur_sum -= weighted[wordindex][1];
      cur_sum += weighted[wordindex + window_size][1];
      window_weight.push(cur_sum);
    }

    let max_sum_window_index = 0;

    if (searchterm_found) {
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

    // add <em/> around searchterms
    const teaser_split = [];
    let index = weighted[max_sum_window_index][2];

    for (let i = max_sum_window_index; i < max_sum_window_index + window_size; i++) {
      const word = weighted[i];

      if (index < word[2]) {
        // missing text from index to start of `word`
        teaser_split.push(body.substring(index, word[2]));
        index = word[2];
      }
      if (word[1] == searchterm_weight) {
        teaser_split.push('<em>');
      }
      index = word[2] + word[0].length;
      teaser_split.push(body.substring(word[2], index));

      if (word[1] == searchterm_weight) {
        teaser_split.push('</em>');
      }
    }
    return teaser_split.join('');
  };

  const showSearch = () => {
    search_wrap.classList.remove('hidden');
    searchicon.setAttribute('aria-expanded', 'true');
  };

  const hiddenSearch = () => {
    search_wrap.classList.add('hidden');
    searchicon.setAttribute('aria-expanded', 'false');

    if (searchresults.length == null) {
      return;
    }

    searchresults.children.forEach(x => x.classList.remove('focus'));
  };

  const init = config => {
    const marker = new Mark(document.querySelector('main'));
    const mark_exclude = [];

    results_options = config.results_options;
    search_options = config.search_options;
    doc_urls = config.doc_urls;

    // Eventhandler for search icon
    searchicon.addEventListener(
      'click',
      () => {
        if (search_wrap.classList.contains('hidden')) {
          showSearch();
          window.scrollTo(0, 0);
          searchbar.select();
        } else {
          hiddenSearch();
        }
      },
      { once: false, passive: true }
    );

    // Eventhandler for keyevents while the searchbar is focused
    const searchbarKeyUpHandler = () => {
      const doSearch = term => {
        // Clear and insert results
        removeChildren(searchresults);

        // Do the actual search
        const results = elasticlunr.Index.load(config.index).search(term, search_options);
        const count = Math.min(results.length, results_options.limit_results);

        document.getElementById('searchresults-header').innerText =
          (results.length > count ? 'Over ' : '') + count + ' search results for: ' + term;

        const terms = term.split(' ');

        for (let i = 0; i < count; i++) {
          const resultElem = document.createElement('li');
          resultElem.innerHTML = formatSearchResult(results[i], terms);

          searchresults.appendChild(resultElem);
        }

        // Display results
        document.getElementById('searchresults-outer').classList.remove('hidden');
      };

      const term = searchbar.value.trim();

      if (term != '') {
        searchbar.classList.add('active');
        doSearch(term);
      } else {
        searchbar.classList.remove('active');
        document.getElementById('searchresults-outer').classList.add('hidden');
        removeChildren(searchresults);
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
          searchbarKeyUpHandler();
          return;
        }
        hiddenSearch();

        // hacky, but just focusing a div only works once
        const tmp = document.createElement('input');

        tmp.setAttribute('style', 'position: absolute; opacity: 0;');
        searchicon.appendChild(tmp);

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

        searchbar.value = decodeURIComponent((url.params[URL_SEARCH_PARAM] + '').replace(/\+/g, '%20'));

        searchbarKeyUpHandler();
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
    window.onpopstate = () => {
      doSearchOrMarkFromUrl();
    };

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

  const filePath = document.getElementById('searcher').dataset.pathtoroot + 'searchindex';

  fetch(filePath + '.json')
    .then(response => response.json())
    .then(json => init(json))
    .catch(() => {
      // Try to load searchindex.js if fetch failed
      const script = document.createElement('script');
      script.src = filePath + '.js';
      script.onload = () => init(search);
      document.head.appendChild(script);
    });

  const hasFocus = () => {
    return searchbar === document.activeElement;
  };

  // Exported functions
  search.hasFocus = hasFocus;
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
