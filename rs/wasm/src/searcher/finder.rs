///
/// The finder module provides WebAssembly-based search functionality.
///
/// It includes methods for initializing the searcher, executing searches,
/// perfrom a search, and return the serch results as an HTML string.
///
use crate::searcher::function::*;
use crate::searcher::highlight::*;
use crate::searcher::hit_list::HitList;
use crate::searcher::js_util::*;

use arrayvec::ArrayVec;
use getset::Getters;
use html_escape::encode_safe;
use macros::error;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use urlencoding::encode;
use wasm_bindgen::prelude::*;

const INITIAL_HEADER: &str = "2文字 (もしくは全角1文字) 以上を入力してください...";

const BUFFER_HTML_SIZE: usize = 200_000;

// Maximum number of search words (entering more words than this will simply be ignored).
const MAX_TOKENS: usize = 8;

#[derive(Serialize)]
struct SearchResult {
    header: String,
    html: Option<String>,
}

#[derive(Deserialize, Getters)]
pub struct DocObject {
    #[get = "pub"]
    id: String,
    #[get = "pub"]
    title: String,
    #[get = "pub"]
    body: String,
    #[get = "pub"]
    breadcrumbs: String,
}

impl DocObject {
    fn sanitize(mut self) -> Self {
        self.id = encode_safe(&self.id).into_owned();
        self.title = encode_safe(&self.title).into_owned();
        self.body = encode_safe(&self.body).into_owned();
        self.breadcrumbs = encode_safe(&self.breadcrumbs).into_owned();

        self
    }
}

fn split_limited<const N: usize>(input: &str) -> ArrayVec<&str, N> {
    let mut vec = ArrayVec::new();

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
}

#[wasm_bindgen]
impl Finder {
    #[wasm_bindgen(constructor)]
    pub fn new(root_path: &str, doc_urls: JsValue, docs: JsValue) -> Result<Finder, JsValue> {
        let url_table: Vec<String> = from_value(doc_urls).map_err(|_| "Failed to convert doc_urls to Vec<String>")?;

        let store_doc: Vec<DocObject> = convert_js_map_to_vec(docs)?
            .into_iter()
            .map(from_value)
            .collect::<Result<Vec<DocObject>, _>>()?
            .into_iter()
            .map(|doc| Ok(doc.sanitize()))
            .collect::<Result<Vec<DocObject>, JsValue>>()?;

        Ok(Self {
            root_path: root_path.to_string(),
            url_table,
            store_doc,
        })
    }

    fn aggregate_results<'a>(&'a self, terms: &'a str) -> HitList<'a> {
        let trimmed = terms.trim();

        let mut tokens: ArrayVec<&str, MAX_TOKENS> = split_limited::<MAX_TOKENS>(trimmed);
        tokens.sort_by_key(|x| self.store_doc.iter().filter(|doc| doc.body.contains(x)).count());

        let hit_docs = {
            let lower = trimmed.to_lowercase();

            self.store_doc
                .iter()
                .filter(|doc| {
                    let body_lower = doc.body().to_lowercase();
                    let header_lower = doc.breadcrumbs().to_lowercase();

                    if body_lower.contains(&lower) || header_lower.contains(&lower) {
                        return true;
                    }

                    tokens.iter().all(|&tok| {
                        let tok_lower = tok.to_lowercase();
                        body_lower.contains(&tok_lower) || header_lower.contains(&tok_lower)
                    })
                })
                .collect::<Vec<&DocObject>>()
        };

        HitList::from_token_set(tokens, hit_docs)
    }

    fn build_search_result(&self, results: HitList, terms: &str, html_buffer: &mut String) {
        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let mark = encode(&normalized_terms.join(" ")).into_owned();

        results.into_iter().for_each(|el| {
            if let Some(url) = self.url_table.get(*el.id()) {
                let (page, head) = parse_uri(url);
                let excerpt = search_result_excerpt(&el.doc().body, &normalized_terms);
                let score_bar = scoring_notation(*el.score());

                html_buffer.push_str(&format!(
                    r#"<li tabindex="0" role="option" id="s{}" aria-label="{} {}pt"><a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div id="score" role="meter" aria-label="score:{}pt">{}</div></li>"#,
                    el.id(), page, el.score(), &self.root_path, page, mark, head, el.doc().breadcrumbs, excerpt, el.score(), score_bar
                ));
            }
            else {
                macros::console_error!("Missing URL for document ID: {}", *el.id());
            }
        });
    }

    pub fn search(&self, terms: &str) -> JsValue {
        if terms.len() <= 1 {
            let result = SearchResult {
                header: INITIAL_HEADER.to_string(),
                html: None,
            };
            return to_value(&result).unwrap();
        }

        let results = self.aggregate_results(terms);

        if results.is_empty() {
            let result = SearchResult {
                header: format!("No search result for : {terms}"),
                html: None,
            };
            return to_value(&result).unwrap();
        }

        let header = format!("{} search results for : {terms}", results.len());
        let mut html_buffer = String::with_capacity(BUFFER_HTML_SIZE);
        self.build_search_result(results, terms, &mut html_buffer);

        to_value(&SearchResult {
            header,
            html: Some(html_buffer),
        })
        .unwrap()
    }
}
