use js_sys::Array;
use serde::Deserialize;
use wasm_bindgen::prelude::*;
use web_sys::{Element, HtmlElement, Node};

mod teaser;
use crate::searcher::teaser::Teaser;

use macros::error;

const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;

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
}

#[derive(Deserialize)]
pub struct ResultObject {
    doc: DocObject,
    key: String,
    score: u16,
}

#[wasm_bindgen]
pub struct SearchResult {
    path_to_root: String,
    li_element: Element,
    parent: Element,
    count: u8,
    teaser: Teaser,
    url_table: Vec<String>,
}

#[wasm_bindgen]
impl SearchResult {
    #[wasm_bindgen(constructor)]
    pub fn new(path_to_root: &str, count: u8, doc_urls: &Array) -> Result<SearchResult, JsValue> {
        let window = web_sys::window().ok_or("No global `window` exists")?;
        let document = window
            .document()
            .ok_or("Should have a document on window")?;

        let li_element = document.create_element("li").expect("failed: create <li>");

        li_element
            .set_attribute("tabindex", "0")
            .expect("failed: set tabindex");
        li_element
            .set_attribute("role", "option")
            .expect("failed: set role");

        let parent = document
            .get_element_by_id("searchresults")
            .ok_or("No element with ID `searchresults`")?;

        let url_table: Vec<String> = doc_urls
            .iter()
            .filter_map(|value| value.as_string())
            .collect();

        Ok(SearchResult {
            path_to_root: path_to_root.to_string(),
            li_element,
            parent,
            count,
            teaser: Teaser::default(),
            url_table,
        })
    }

    fn add_element(&self, content: &str, page: &str, score: &u16) {
        let node: Node = self
            .li_element
            .clone_node_with_deep(true)
            .expect("Failed to clone node");

        let cloned_element: HtmlElement = match node.dyn_into() {
            Ok(html_element) => html_element,
            Err(_) => {
                macros::console_error!("Error converting Node to HtmlElement");
                return;
            }
        };

        cloned_element
            .set_attribute("aria-label", &format!("{page} {score}pt"))
            .expect("failed: set aria-label");

        cloned_element
            .insert_adjacent_html("afterbegin", content)
            .expect("failed: insert_adjacent_html");

        self.parent
            .append_child(&cloned_element)
            .expect("failed: append_child");
    }

    pub fn append_search_result(&mut self, results: &Array, term: &str) {
        let result: Vec<ResultObject> = serde_wasm_bindgen::from_value(results.into())
            .expect("Failed to deserialize JsValue to Vec<ResultObject>");

        let terms = term.split_whitespace().collect::<Vec<&str>>();

        let mark = js_sys::encode_uri_component(&terms.join("%20"))
            .as_string()
            .unwrap_or_default()
            .replace('\'', "%27");

        result.into_iter().for_each(|el| {
            self.teaser.clear();

            let idx = match el.key.parse::<usize>() {
                Ok(n) => n,
                Err(_) => {
                    macros::console_error!("Error: Invalid result.ref: {}", el.key);
                    return;
                }
            };

            let (page, head) = parse_uri(&self.url_table[idx]);

            let result = self
                .teaser
                .search_result_excerpt(&el.doc.body, terms.clone(), self.count);

            let score_bar = scoring_notation(el.score as usize);

            self.add_element(&format!(
                r#"<a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div id="score" role="meter" aria-label="score:{}pt">{}</div>"#,
                &self.path_to_root, page, mark, head, el.doc.breadcrumbs, result, el.score, score_bar),
                page, &el.score
            );
        });
    }
}
