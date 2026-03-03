///
/// The finder module provides WebAssembly-based search functionality.
///
/// It includes methods for initializing the searcher, executing searches,
/// perfrom a search, and return the serch results as an HTML string.
///
use crate::searcher::doc::DocObject;
use crate::searcher::excerpt::generate;
use crate::searcher::hit_list::HitList;
use crate::searcher::js_util::*;

use serde::Serialize;
use serde_wasm_bindgen::{from_value, to_value};
use std::fmt::Write;
use urlencoding::encode;
use wasm_bindgen::prelude::*;

const INITIAL_HEADER: &str = "2文字 (もしくは全角1文字) 以上を入力してください...";

const BUFFER_HTML_MAGNIFICATION: usize = 1000;

// Maximum number of search words (entering more words than this will simply be ignored).
const MAX_TOKENS: usize = 8;

const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;
const SCORE_MAX_BAR: usize = 256;

#[derive(Serialize)]
struct SearchResult {
    header: String,
    html: Option<String>,
}

fn split_limited<const N: usize>(input: &str) -> Vec<&str> {
    let mut vec = Vec::new();

    for x in input.split_whitespace() {
        if vec.len() >= N {
            break;
        }
        vec.push(x);
    }

    vec
}

fn parse_uri(link_uri: &str) -> (&str, &str) {
    link_uri.split_once('#').unwrap_or((link_uri, ""))
}

fn scoring_notation(score: usize) -> String {
    let s = SCORE_CHARACTER.repeat(std::cmp::min(score, SCORE_MAX_BAR) / SCORE_RATE);
    format!("{s} ({score}pt)")
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
        })
    }

    /// Returns documents that match the given terms, either as full string match or token-wise match.
    fn filter_docs_by_terms<'a>(&'a self, terms: &str) -> Vec<&'a DocObject> {
        let trimmed = terms.trim();
        let tokens: Vec<&str> = split_limited::<MAX_TOKENS>(trimmed);
        let lower = trimmed.to_lowercase();
        let token_lowers = tokens.iter().map(|t| t.to_lowercase()).collect::<Vec<String>>();

        self.store_doc
            .iter()
            .filter(|doc| {
                if doc.body_lower().contains(&lower) || doc.breadcrumbs_lower().contains(&lower) {
                    return true;
                }

                token_lowers.iter().all(|tok_lower| {
                    doc.body_lower().contains(tok_lower) || doc.breadcrumbs_lower().contains(tok_lower)
                })
            })
            .collect()
    }

    fn build_search_result(&self, results: HitList, terms: &str, html_buffer: &mut String) -> usize {
        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let mark = encode(terms).into_owned();

        let mut rendered = 0;

        results.into_iter().for_each(|el| {
                if let Some(url) = self.url_table.get(*el.id()) {
                    let (page, head) = parse_uri(url);
                    let excerpt = generate(el.doc().body(), &normalized_terms);
                    let score_bar = scoring_notation(*el.score());

                    write!(html_buffer,
                        r#"<li tabindex="0" role="option" id="s{}" aria-label="{} {}pt"><a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div class="score" role="meter" aria-label="score:{}pt">{}</div></li>"#,
                        el.id(), page, el.score(), &self.root_path, page, mark, head, el.doc().breadcrumbs(), excerpt, el.score(), score_bar
                    ).unwrap();

                    rendered += 1;
                }
                // TODO: Ideally, we could include the code only during debugging, but it's not working out well at the moment...
                // else { macros::console_error!("Missing URL for document ID: {}", *el.id()); }
            });

        rendered
    }

    pub fn search(&self, value: &str) -> JsValue {
        let terms = value.trim();

        if terms.len() <= 1 {
            let result = SearchResult {
                header: INITIAL_HEADER.to_string(),
                html: None,
            };
            return to_value(&result).unwrap();
        }

        let results = HitList::from_token_set(
            split_limited::<MAX_TOKENS>(terms.trim()),
            self.filter_docs_by_terms(terms),
        );

        let mut html_buffer = String::with_capacity(results.len() * BUFFER_HTML_MAGNIFICATION);
        let hit = self.build_search_result(results, terms, &mut html_buffer);

        if hit == 0 {
            let result = SearchResult {
                header: format!("No search result for : {terms}"),
                html: None,
            };
            return to_value(&result).unwrap();
        }

        to_value(&SearchResult {
            header: format!("{} search results for : {terms}", hit),
            html: Some(html_buffer),
        })
        .unwrap()
    }
}
