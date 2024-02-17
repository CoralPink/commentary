use js_sys::Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use web_sys::{Document, Element};

mod teaser;
use crate::searcher::teaser::Teaser;

const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

macro_rules! console_error {
    ($($t:tt)*) => (error(&format_args!($($t)*).to_string()))
}

fn parse_uri(link_uri: &str) -> (&str, &str) {
    let uri: Vec<&str> = link_uri.split('#').collect();
    let head = if uri.len() > 1 { uri[1] } else { "" };

    (uri[0], head)
}

fn scoring_notation(score: usize) -> String {
    format!(
        "{} ({}pt)",
        SCORE_CHARACTER.repeat(score / SCORE_RATE),
        score
    )
}

#[derive(Deserialize)]
pub struct DocObject {
    body: String,
    breadcrumbs: String,
    //id: String,
    //title: String,
}

#[derive(Deserialize)]
pub struct ResultObject {
    doc: DocObject,
    key: String,
    score: usize,
}

#[wasm_bindgen]
pub struct SearchResult {
    path_to_root: String,
    document: Document,
    parent: Element,
    count: usize,
    teaser: Teaser,
    url_table: Vec<String>,
}

#[wasm_bindgen]
impl SearchResult {
    #[wasm_bindgen(constructor)]
    pub fn new(
        path_to_root: &str,
        count: usize,
        doc_urls: &Array,
    ) -> Result<SearchResult, JsValue> {
        let window = web_sys::window().ok_or("No global `window` exists")?;
        let document = window
            .document()
            .ok_or("Should have a document on window")?;
        let parent = document
            .get_element_by_id("searchresults")
            .ok_or("No element with ID `searchresults`")?;

        let url_table: Vec<String> = doc_urls
            .iter()
            .filter_map(|value| value.as_string())
            .collect();

        Ok(SearchResult {
            path_to_root: path_to_root.to_string(),
            document,
            parent,
            count,
            teaser: Teaser::default(),
            url_table,
        })
    }

    pub fn append_search_result(&mut self, results: &Array, term: &str) {
        let elements: Vec<ResultObject> = serde_wasm_bindgen::from_value(results.into())
            .expect("Failed to deserialize JsValue to Vec<ResultObject>");

        let terms = term.split_whitespace().collect::<Vec<&str>>();

        let highlight = js_sys::encode_uri_component(&terms.join("%20"))
            .as_string()
            .unwrap_or_default()
            .replace('\'', "%27");

        elements.into_iter().for_each(|el| {
            self.teaser.clear();

            let idx = match el.key.parse::<usize>() {
                Ok(n) => n,
                Err(_) => {
                    console_error!("Error: Invalid result.ref: {}", el.key);
                    return;
                }
            };

            let (page, head) = parse_uri(&self.url_table[idx]);

            let teaser = self
                .teaser
                .search_result_excerpt(&el.doc.body, terms.clone(), self.count);

            let score_bar = scoring_notation(el.score);

            let new_element = self
                .document
                .create_element("li")
                .expect("failed: create <li>");

            new_element.set_inner_html(&format!(
                r#"<a href="{}{}?highlight={}#{}">{}</a><span class="teaser" aria-label="Search Result Teaser">{}</span><div id="score">{}</div>"#,
                &self.path_to_root, page, highlight, head, el.doc.breadcrumbs, teaser, score_bar
            ));

            self.parent
                .append_child(&new_element)
                .expect("failed: append_child");
        });
    }
}
