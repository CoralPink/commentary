///
/// The finder module provides WebAssembly-based search functionality.
/// It includes methods for initializing the searcher, executing searches,
/// and rendering search results in the DOM.
///
use crate::searcher::algo::score;
use crate::searcher::function::*;
use crate::searcher::js_util::*;

use html_escape::encode_safe;
use macros::error;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use std::collections::HashMap;
use urlencoding::encode;
use wasm_bindgen::prelude::*;

const SCORE_LOWER_LIMIT: usize = 64;
const SCORE_LOWER_LIMIT_ASCII: usize = 32;

const INITIAL_HEADER: &str = "2文字 (もしくは全角1文字) 以上を入力してください...";

const BUFFER_HTML_SIZE: usize = 200_000;

#[derive(Deserialize)]
struct DocObject {
    id: String,
    title: String,
    body: String,
    breadcrumbs: String,
}

impl DocObject {
    fn sanitize(mut self) -> Self {
        self.title = encode_safe(&self.title).into_owned();
        self.body = encode_safe(&self.body).into_owned();
        self.breadcrumbs = encode_safe(&self.breadcrumbs).into_owned();
        self.id = encode_safe(&self.id).into_owned();

        self
    }
}

struct SearchResult<'a> {
    doc: &'a DocObject,
    key: String,
    score: usize,
}

struct ResultEntry<'a> {
    result: SearchResult<'a>,
    first_match_index: usize,
}

#[wasm_bindgen]
pub struct Finder {
    root_path: String,
    parent: web_sys::Element,
    header: web_sys::Element,
    url_table: Vec<String>,
    store_doc: Vec<DocObject>,
    limit: usize,
}

#[wasm_bindgen]
impl Finder {
    #[wasm_bindgen(constructor)]
    pub fn new(root_path: &str, doc_urls: JsValue, docs: JsValue, limit: usize) -> Result<Finder, JsValue> {
        let window = web_sys::window().ok_or("No global `window` exists")?;
        let document = window.document().ok_or("Should have a document on window")?;

        let parent = document
            .get_element_by_id("searchresults")
            .ok_or("No element with ID `searchresults`")?;

        let header = document
            .get_element_by_id("results-header")
            .ok_or("No element with ID `results-header`")?;

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
            parent,
            header,
            url_table,
            store_doc,
            limit,
        })
    }

    fn append_search_result(&self, results: Vec<SearchResult>, terms: &str) {
        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let mark = encode(&normalized_terms.join(" ")).into_owned();

        let mut html_buffer = String::with_capacity(BUFFER_HTML_SIZE);

        results.into_iter().for_each(|el| {
            let idx = match el.key.parse::<usize>() {
                Ok(n) => n,
                Err(_) => {
                    macros::console_error!("Error: Invalid result.ref: {}", el.key);
                    return;
                }
            };

            let (page, head) = parse_uri(&self.url_table[idx]);
            let excerpt = search_result_excerpt(&el.doc.body, &normalized_terms);
            let score_bar = scoring_notation(el.score);

            html_buffer.push_str(&format!(
                r#"<li tabindex="0" role="option" id="s{}" aria-label="{} {}pt"><a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div id="score" role="meter" aria-label="score:{}pt">{}</div></li>"#,
                el.doc.id, page, el.score, &self.root_path, page, mark, head, el.doc.breadcrumbs, excerpt, el.score, score_bar
            ));
        });

        self.parent
            .insert_adjacent_html("beforeend", &html_buffer)
            .expect("failed: insert_adjacent_html");
    }

    fn find_matches<'a>(&'a self, term: &str, docs: Option<&[&'a DocObject]>) -> Vec<SearchResult<'a>> {
        let target_docs: Vec<&DocObject> = match docs {
            Some(d) => d.to_vec(),
            None => self.store_doc.iter().collect(),
        };

        let mut results: Vec<ResultEntry> = target_docs
            .into_iter()
            .filter_map(|doc| {
                let content = format!("{} {}", doc.title, doc.body);

                // TODO: `Score::compute` also takes into account lowercase and uppercase scores,
                //       but they are temporarily disabled.
                let content_lower = content.to_lowercase();
                let terms_lower = term.to_lowercase();

                let score = score::compute(&terms_lower, &content_lower);

                if score == 0 {
                    return None;
                }

                let key = doc.id.to_owned();

                Some(ResultEntry {
                    result: SearchResult { doc, key, score },
                    first_match_index: content.find(term).unwrap_or(content.len()),
                })
            })
            .collect();

        results.sort_by(|a, b| {
            b.result
                .score
                .cmp(&a.result.score)
                .then_with(|| a.first_match_index.cmp(&b.first_match_index))
                .then_with(|| a.result.doc.id.cmp(&b.result.doc.id))
        });

        results.into_iter().map(|entry| entry.result).take(self.limit).collect()
    }

    fn aggregate_results(&self, terms: &str, minimum_score: usize) -> Vec<SearchResult> {
        let trimmed_terms = terms.trim();
        let term_tokens: Vec<&str> = trimmed_terms.split_whitespace().collect();

        if term_tokens.len() == 1 {
            return self.find_matches(term_tokens[0], None);
        }

        let mut results_map: HashMap<String, SearchResult> = HashMap::new();

        let mut sorted_tokens = term_tokens.to_vec();
        sorted_tokens.sort_by_key(|token| token.len());

        let trimmed_lower = trimmed_terms.to_lowercase();
        let filtered_docs: Vec<&DocObject> = self
            .store_doc
            .iter()
            .filter(|doc| {
                let body_lower = doc.body.to_lowercase();
                body_lower.contains(&trimmed_lower) || term_tokens.iter().all(|&term| body_lower.contains(term))
            })
            .collect();

        for (i, token) in sorted_tokens.iter().enumerate() {
            let results = self.find_matches(token, Some(&filtered_docs));

            if i == 0 {
                for result in results {
                    results_map.insert(result.doc.id.clone(), result);
                }
            } else {
                for result in results {
                    if let Some(existing) = results_map.get_mut(&result.doc.id) {
                        existing.score += result.score;
                    }
                }
            }
        }

        results_map.retain(|_, result| result.score >= minimum_score);

        let mut results: Vec<SearchResult> = results_map.into_values().collect();
        results.sort_by(|a, b| b.score.cmp(&a.score));
        results.truncate(self.limit);

        results
    }

    pub fn search(&self, terms: &str) {
        if terms.len() <= 1 {
            self.header.set_text_content(Some(INITIAL_HEADER));
            return;
        }

        let minimum_score = if is_full_width_or_ascii(terms) {
            SCORE_LOWER_LIMIT
        } else {
            SCORE_LOWER_LIMIT_ASCII
        };

        let results = self.aggregate_results(terms, minimum_score);

        if results.is_empty() {
            self.header
                .set_text_content(Some(&format!("No search result for : {terms}")));
            return;
        }

        self.header
            .set_text_content(Some(&format!("{} search results for : {terms}", results.len())));

        self.append_search_result(results, terms);
    }
}
