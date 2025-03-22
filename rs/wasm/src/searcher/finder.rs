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
use urlencoding::encode;
use wasm_bindgen::prelude::*;

const SCORE_LOWER_LIMIT: usize = 64;
const SCORE_LOWER_LIMIT_ASCII: usize = 1;

const INITIAL_HEADER: &str = "2文字 (もしくは全角1文字) 以上を入力してください...";

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

        let mut html_buffer = String::new();

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

    fn find_matches<'a>(&'a self, terms: &str, minimum_score: usize) -> Vec<SearchResult<'a>> {
        let mut results: Vec<ResultEntry> = self
            .store_doc
            .iter()
            .filter_map(|doc| {
                let content = format!("{} {}", doc.title, doc.body);
                let score = score::compute(terms, &content);

                if score < minimum_score {
                    return None;
                }

                let key = doc.id.to_owned();

                Some(ResultEntry {
                    result: SearchResult { doc, key, score },
                    first_match_index: content.find(terms).unwrap_or(content.len()),
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

pub fn search(&self, terms: &str) {
    let trimmed_terms = terms.trim();
    let is_ascii = is_full_width_or_ascii(terms);

    if trimmed_terms.is_empty() || (trimmed_terms.len() <= 1 && !is_ascii) {
        self.header.set_text_content(Some(INITIAL_HEADER));
        return;
    }

    // Split the search terms by whitespace
    let term_tokens: Vec<&str> = trimmed_terms.split_whitespace().collect();

    let minimum_score = if is_ascii {
        SCORE_LOWER_LIMIT
    } else {
        SCORE_LOWER_LIMIT_ASCII
    };

    // If there are multiple tokens, search for each one separately
    let results = if term_tokens.len() > 1 {
        // Get results for each token
        let mut all_results = Vec::new();
        for token in &term_tokens {
            all_results.extend(self.find_matches(token, minimum_score));
        }
        
        // Sort and deduplicate results based on doc.id
        all_results.sort_by(|a, b| b.score.cmp(&a.score));
        let mut deduplicated = Vec::new();
        let mut seen_ids = std::collections::HashSet::new();
        
        for result in all_results {
            if seen_ids.insert(&result.doc.id) {
                deduplicated.push(result);
                if deduplicated.len() >= self.limit {
                    break;
                }
            }
        }
        deduplicated
    } else if !term_tokens.is_empty() {
        self.find_matches(term_tokens[0], minimum_score)
    } else {
        Vec::new()
    };

    if results.is_empty() {
        self.header
            .set_text_content(Some(&format!("No search result for : {trimmed_terms}")));
        return;
    }

    self.header
        .set_text_content(Some(&format!("{} search results for : {trimmed_terms}", results.len())));

    self.append_search_result(results, trimmed_terms);
}
}
