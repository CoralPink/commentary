///
/// The finder module provides WebAssembly-based search functionality.
///
/// It includes methods for initializing the searcher, executing searches,
/// perfrom a search, and return the serch results as an HTML string.
///
use crate::searcher::doc::DocObject;
use crate::searcher::excerpt::generate;
use crate::searcher::hit_list::HitList;
use crate::searcher::utils::*;

use serde::Serialize;
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

// Maximum number of search words (entering more words than this will simply be ignored).
const MAX_TOKENS: usize = 8;

#[derive(Serialize)]
struct SearchResponse {
    id: usize,
    page: String,
    head: String,
    breadcrumbs: String,
    score: usize,
    excerpt: String,
}

#[wasm_bindgen]
pub struct Finder {
    url_table: Vec<String>,
    store_doc: Vec<DocObject>,
}

#[wasm_bindgen]
impl Finder {
    #[wasm_bindgen(constructor)]
    pub fn new(doc_urls: JsValue, docs: JsValue) -> Result<Finder, JsValue> {
        let url_table: Vec<String> = from_value(doc_urls).map_err(|_| "Failed to convert doc_urls to Vec<String>")?;

        let store_doc: Vec<DocObject> = convert_js_map_to_vec(docs)?
            .into_iter()
            .map(|jsv| {
                from_value::<DocObject>(jsv)
                    .map(|doc| doc.sanitize())
                    .map_err(JsValue::from)
            })
            .collect::<Result<_, JsValue>>()?;

        Ok(Self { url_table, store_doc })
    }

    fn aggregate_results<'a>(&'a self, terms: &'a str) -> HitList<'a> {
        let trimmed = terms.trim();

        let mut tokens: Vec<&str> = trimmed.split_whitespace().take(MAX_TOKENS).collect();
        tokens.sort_by_key(|x| self.store_doc.iter().filter(|doc| doc.body().contains(x)).count());

        let lower = trimmed.to_lowercase();
        let hit_docs = self
            .store_doc
            .iter()
            .filter(|doc| {
                let body_lower = doc.body().to_lowercase();
                let header_lower = doc.breadcrumbs().to_lowercase();

                body_lower.contains(&lower)
                    || header_lower.contains(&lower)
                    || tokens
                        .iter()
                        .all(|tok| body_lower.contains(tok) || header_lower.contains(tok))
            })
            .collect::<Vec<&DocObject>>();

        HitList::from_token_set(tokens, hit_docs)
    }

    fn parse_uri(&self, id: usize) -> Option<(String, String)> {
        let url = self.url_table.get(id)?;
        let (l, r) = url.split_once('#').unwrap_or((url, ""));

        Some((l.to_string(), r.to_string()))
    }

    pub fn search(&self, term: &str) -> JsValue {
        let terms = term.trim();
        let results = self.aggregate_results(terms);

        if results.is_empty() {
            return JsValue::NULL;
        }

        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let items = results
            .into_iter()
            .filter_map(|el| {
                let id = *el.id();
                let (page, head) = self.parse_uri(id)?;
                let excerpt = generate(el.doc().body(), &normalized_terms);

                Some(SearchResponse {
                    id,
                    page,
                    head,
                    breadcrumbs: el.doc().breadcrumbs().clone(),
                    score: *el.score(),
                    excerpt,
                })
            })
            .collect::<Vec<_>>();

        to_value(&items).unwrap()
    }
}
