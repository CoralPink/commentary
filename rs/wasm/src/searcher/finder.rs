///
/// The finder module provides WebAssembly-based search functionality.
///
/// It includes methods for initializing the searcher, executing searches,
/// perfrom a search, and return the serch results as an HTML string.
///
use crate::searcher::constants::*;
use crate::searcher::doc::DocObject;
use crate::searcher::hit_list::HitList;
use crate::searcher::html_builder::HtmlBuilder;

use serde_wasm_bindgen::from_value;
use std::cell::RefCell;
use wasm_bindgen::prelude::*;

fn split_limited<const N: usize>(input: &str) -> Vec<&str> {
    let mut vec = Vec::with_capacity(N);

    for x in input.split_whitespace() {
        if vec.len() >= N {
            break;
        }
        vec.push(x);
    }

    vec
}

#[wasm_bindgen]
pub struct Finder {
    root_path: String,
    url_table: Vec<String>,
    store_doc: Vec<DocObject>,
    html_builder: RefCell<HtmlBuilder>,
}

#[wasm_bindgen]
impl Finder {
    #[wasm_bindgen(constructor)]
    pub fn new(root_path: &str, doc_urls: JsValue, docs: JsValue) -> Result<Finder, JsValue> {
        Ok(Self {
            root_path: root_path.to_string(),
            url_table: from_value(doc_urls).map_err(|_| "Failed to convert doc_urls")?,
            store_doc: DocObject::vec_from_js(docs)?,
            html_builder: RefCell::new(HtmlBuilder::new_for_results(LIMIT_RESULTS)),
        })
    }

    /// Returns documents that match the given terms, either as full string match or token-wise match.
    fn filter_docs_by_terms<'a>(&'a self, normalized_terms: &[String]) -> impl Iterator<Item = &'a DocObject> {
        let first_chars: Vec<char> = normalized_terms.iter().filter_map(|t| t.chars().next()).collect();

        self.store_doc.iter().filter(move |doc| {
            let body = doc.body_lower();
            let crumbs = doc.breadcrumbs_lower();

            if !first_chars.iter().all(|c| body.contains(*c) || crumbs.contains(*c)) {
                return false;
            }

            normalized_terms
                .iter()
                .all(|tok| body.contains(tok) || crumbs.contains(tok))
        })
    }

    pub fn search(&self, value: &str) -> Box<[u8]> {
        let terms = value.trim();
        let mut builder = self.html_builder.borrow_mut();

        builder.clear();

        if terms.len() <= 1 {
            return builder.finish(MESSAGE_INITIAL);
        }

        let normalized_terms: Vec<String> = split_limited::<SEARCH_TERM_MAX>(terms)
            .iter()
            .map(|t| t.to_ascii_lowercase())
            .collect();

        let matching_docs: Vec<&DocObject> = self.filter_docs_by_terms(&normalized_terms).collect();
        let results = HitList::from_token_set(&normalized_terms, &matching_docs);

        let hit = builder.build_search_result(&self.root_path, &self.url_table, results, &normalized_terms);

        let header = MESSAGE_RESULT.replace("{1}", &hit.to_string()).replace("{2}", terms);

        builder.finish(&header)
    }
}
