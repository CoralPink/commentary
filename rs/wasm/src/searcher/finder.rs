///
/// The finder module provides WebAssembly-based search functionality.
///
/// It includes methods for initializing the searcher, executing searches,
/// perfrom a search, and return the serch results as an HTML string.
///
use crate::searcher::constants::*;
use crate::searcher::doc::DocObject;
use crate::searcher::hit_list::HitScorer;
use crate::searcher::html_builder::HtmlBuilder;

use serde_wasm_bindgen::from_value;
use std::cell::RefCell;
use wasm_bindgen::prelude::*;

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

    pub fn search(&self, value: &str) -> Box<[u8]> {
        let terms = value.trim();
        let mut builder = self.html_builder.borrow_mut();

        builder.clear();

        if terms.len() <= 1 {
            return builder.finish(MESSAGE_INITIAL);
        }

        let normalized_terms: Vec<String> = value
            .split_whitespace()
            .take(SEARCH_TERM_MAX)
            .map(|t| t.to_ascii_lowercase())
            .collect();

        let hit = builder.build_search_result(
            &self.root_path,
            &self.url_table,
            HitScorer::new(&normalized_terms).compute(self.store_doc.iter()),
            &normalized_terms,
        );

        builder.finish(&MESSAGE_RESULT.replace("{1}", &hit.to_string()).replace("{2}", terms))
    }
}
