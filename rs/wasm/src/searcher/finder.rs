///
/// The finder module provides WebAssembly-based search functionality.
/// It includes methods for initializing the searcher, executing searches,
/// and rendering search results in the DOM.
///
use crate::searcher::algo::score;
use crate::searcher::function::*;
use crate::searcher::js_util::*;

use arrayvec::ArrayVec;
use html_escape::encode_safe;
use macros::error;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use urlencoding::encode;
use wasm_bindgen::prelude::*;

const SCORE_LOWER_LIMIT: usize = 64;
const SCORE_LOWER_LIMIT_ASCII: usize = 32;

const INITIAL_HEADER: &str = "2文字 (もしくは全角1文字) 以上を入力してください...";

const BUFFER_HTML_SIZE: usize = 200_000;

// maximum number of search results
const LIMIT_RESULTS: usize = 100;
// Maximum number of search words (entering more words than this will simply be ignored).
const MAX_TOKENS: usize = 8;

#[derive(Deserialize)]
struct DocObject {
    id: String,
    title: String,
    body: String,
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

struct ResultEntry<'a> {
    doc: &'a DocObject,
    score: usize,
    first_index: usize,
    id: usize,
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
    parent: web_sys::Element,
    header: web_sys::Element,
    url_table: Vec<String>,
    store_doc: Vec<DocObject>,
}

#[wasm_bindgen]
impl Finder {
    #[wasm_bindgen(constructor)]
    pub fn new(root_path: &str, doc_urls: JsValue, docs: JsValue) -> Result<Finder, JsValue> {
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
        })
    }

    fn append_search_result(&self, results: ArrayVec<ResultEntry, LIMIT_RESULTS>, terms: &str) {
        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let mark = encode(&normalized_terms.join(" ")).into_owned();

        let mut html_buffer = String::with_capacity(BUFFER_HTML_SIZE);

        results.into_iter().for_each(|el| {
            let idx = match el.doc.id.parse::<usize>() {
                Ok(n) => n,
                Err(_) => {
                    macros::console_error!("Error: Invalid result.ref: {}", el.doc.id);
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

    fn find_matches<'a>(
        &'a self,
        term: &str,
        docs: Option<&[&'a DocObject]>,
    ) -> ArrayVec<ResultEntry<'a>, LIMIT_RESULTS> {
        let target_docs: Vec<&DocObject> = match docs {
            Some(d) => d.to_vec(),
            None => self.store_doc.iter().collect(),
        };

        let mut results: Vec<ResultEntry> = target_docs
            .into_iter()
            .filter_map(|doc| {
                let body_score = score::compute(term, &doc.body);
                let breadcrumbs_score = score::compute(term, &doc.breadcrumbs);

                let score = body_score + breadcrumbs_score;

                if score == 0 {
                    return None;
                }
                let first_index = doc.body.find(term).unwrap_or(usize::MAX);
                let id = doc.id.parse::<usize>().unwrap_or(usize::MAX);

                Some(ResultEntry {
                    doc,
                    score,
                    first_index,
                    id,
                })
            })
            .collect();

        results.sort_by(|a, b| {
            b.score
                .cmp(&a.score)
                .then_with(|| a.id.cmp(&b.id))
                .then_with(|| a.first_index.cmp(&b.first_index))
        });

        results.into_iter().take(LIMIT_RESULTS).collect()
    }

    fn aggregate_results(&self, terms: &str, minimum_score: usize) -> ArrayVec<ResultEntry, LIMIT_RESULTS> {
        let trimmed = terms.trim();

        if trimmed.len() == 1 {
            let mut results = self.find_matches(terms, None);
            results.retain(|result| result.score >= minimum_score);

            return results;
        }

        let mut tokens: ArrayVec<&str, MAX_TOKENS> = split_limited::<MAX_TOKENS>(trimmed);
        tokens.sort_by_key(|x| self.store_doc.iter().filter(|doc| doc.body.contains(x)).count());

        let hit_docs = {
            let lower = trimmed.to_lowercase();

            self.store_doc
                .iter()
                .filter(|doc| {
                    let body = doc.body.to_lowercase();
                    body.contains( &lower ) || tokens.iter().all(| &term | body.contains( &term .to_lowercase()))
                })
                .collect::<Vec<&DocObject>>()
        };

        let mut entry = Vec::with_capacity(hit_docs.len().min(LIMIT_RESULTS));

        for (idx, token) in tokens.iter().enumerate() {
            let results = self.find_matches(token, Some(&hit_docs));

            if idx == 0 {
                entry.extend(results);
                continue;
            }

            for x in results {
                if let Some(existing) = entry.iter_mut().find(|entry| entry.doc.id == x.doc.id) {
                    existing.score += x.score;
                } else {
                    entry.push(x);
                }
            }
        }

        entry.sort_by(|a, b| b.score.cmp(&a.score));
        entry.truncate(LIMIT_RESULTS);

        entry.into_iter().collect()
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
