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
use crate::searcher::js_util::*;

use serde::Serialize;
use serde_wasm_bindgen::{from_value, to_value};
use std::cell::RefCell;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
struct SearchResult {
    header: String,
    html: Option<String>,
}

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
        let url_table: Vec<String> = from_value(doc_urls).map_err(|_| "Failed to convert doc_urls")?;

        let store_doc: Vec<DocObject> = convert_js_map_to_vec(docs)?
            .into_iter()
            .map(|jsv| {
                from_value::<DocObject>(jsv)
                    .map(|doc| doc.sanitize())
                    .map_err(JsValue::from)
            })
            .collect::<Result<_, JsValue>>()?;

        Ok(Self {
            root_path: root_path.to_string(),
            url_table,
            store_doc,
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

    pub fn search(&self, value: &str) -> JsValue {
        let terms = value.trim();

        if terms.len() <= 1 {
            return to_value(&SearchResult {
                header: INITIAL_MESSAGE.to_string(),
                html: None,
            })
            .unwrap();
        }

        let normalized_terms: Vec<String> = split_limited::<SEARCH_TERM_MAX>(terms)
            .iter()
            .map(|t| t.to_ascii_lowercase())
            .collect();

        let matching_docs: Vec<&DocObject> = self.filter_docs_by_terms(&normalized_terms).collect();

        let results = HitList::from_token_set(&normalized_terms, &matching_docs);

        let mut builder = self.html_builder.borrow_mut();
        builder.clear();

        let hit = builder.build_search_result(&self.root_path, &self.url_table, results, &normalized_terms);

        if hit == 0 {
            return to_value(&SearchResult {
                header: format!("No search result for : {terms}"),
                html: None,
            })
            .unwrap();
        }

        to_value(&SearchResult {
            header: format!("{} search results for : {terms}", hit),
            html: Some(builder.finish()),
        })
        .unwrap()
    }
}
