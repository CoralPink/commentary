/// The finder module provides WebAssembly-based search functionality.
/// It includes methods for initializing the searcher, executing searches,
/// and rendering search results in the DOM.

use crate::searcher::algo::score::calc_score;
use crate::searcher::function::*;
use crate::searcher::js_util::*;

use html_escape::encode_safe;
use macros::error;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use urlencoding::encode;
use wasm_bindgen::prelude::*;

pub const RESULT_ID_START: usize = 1;
const LOWER_LIMIT_SCORE: usize = 8; //56

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
    teaser_word_count: usize,
    url_table: Vec<String>,
    store_doc: Vec<DocObject>,
    limit: usize,
}

#[wasm_bindgen]
impl Finder {
    #[wasm_bindgen(constructor)]
    pub fn new(
        root_path: &str,
        teaser_word_count: usize,
        doc_urls: JsValue,
        docs: JsValue,
        limit: usize,
    ) -> Result<Finder, JsValue> {
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

        Ok(Finder {
            root_path: root_path.to_string(),
            parent,
            header,
            teaser_word_count,
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
        let mut id_cnt = RESULT_ID_START;

        results.into_iter().for_each(|el| {
            let idx = match el.key.parse::<usize>() {
                Ok(n) => n,
                Err(_) => {
                    macros::console_error!("Error: Invalid result.ref: {}", el.key);
                    return;
                }
            };

            let (page, head) = parse_uri(&self.url_table[idx]);
            let excerpt = search_result_excerpt(&el.doc.body, self.teaser_word_count, &normalized_terms);
            let score_bar = scoring_notation(el.score);

            html_buffer.push_str(&format!(
                r#"<li tabindex="0" role="option" id="s{id_cnt}" aria-label="{page} {}pt"><a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div id="score" role="meter" aria-label="score:{}pt">{}</div></li>"#,
                el.score, &self.root_path, page, mark, head, el.doc.breadcrumbs, excerpt, el.score, score_bar
            ));

            id_cnt += 1;
        });

        self.parent
            .insert_adjacent_html("beforeend", &html_buffer)
            .expect("failed: insert_adjacent_html");
    }

    fn find_matches<'a>(&'a self, terms: &str) -> Vec<SearchResult<'a>> {
        let mut results: Vec<ResultEntry> = self
            .store_doc
            .iter()
            .filter_map(|doc| {
                let content = format!("{} {}", doc.title, doc.body);
                let score = calc_score(terms, &content);

                if score < LOWER_LIMIT_SCORE {
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
        });

        results.into_iter().map(|entry| entry.result).take(self.limit).collect()
    }

    pub fn search(&self, terms: &str) {
        if terms.is_empty() || (terms.len() <= 1 && is_full_width_or_ascii(terms)) {
            self.header.set_text_content(Some(INITIAL_HEADER));
            return;
        }

        let results = self.find_matches(terms);

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
