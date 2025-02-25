use serde::Deserialize;
use urlencoding::encode;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;
use web_sys::{Element, HtmlElement, Node};

mod teaser;
use crate::searcher::teaser::Teaser;

use macros::error;

const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;

const RESULT_ID_START: usize = 1;

fn parse_uri(link_uri: &str) -> (&str, &str) {
    let uri: Vec<&str> = link_uri.split('#').collect();
    let head = if uri.len() > 1 { uri[1] } else { "" };

    (uri[0], head)
}

fn scoring_notation(score: u16) -> String {
    let str = SCORE_CHARACTER.repeat((score as usize) / SCORE_RATE);
    format!("{str} ({score}pt)")
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
    pub fn new(path_to_root: &str, count: u8, doc_urls: JsValue) -> Result<SearchResult, JsValue> {
        let window = web_sys::window().ok_or("No global `window` exists")?;
        let document = window.document().ok_or("Should have a document on window")?;

        let li_element = document.create_element("li").expect("failed: create <li>");

        li_element.set_attribute("tabindex", "0").expect("failed: set tabindex");
        li_element.set_attribute("role", "option").expect("failed: set role");

        let parent = document
            .get_element_by_id("searchresults")
            .ok_or("No element with ID `searchresults`")?;

        let url_table: Vec<String> =
            serde_wasm_bindgen::from_value(doc_urls).map_err(|_| "Failed to convert doc_urls to Vec<String>")?;

        Ok(SearchResult {
            path_to_root: path_to_root.to_string(),
            li_element,
            parent,
            count,
            teaser: Teaser::default(),
            url_table,
        })
    }

    fn add_element(&self, content: &str, id: &usize, page: &str, score: &u16) {
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
            .set_attribute("id", &format!("s{id}"))
            .expect("failed: set id");

        cloned_element
            .set_attribute("aria-label", &format!("{page} {score}pt"))
            .expect("failed: set aria-label");

        cloned_element
            .insert_adjacent_html("afterbegin", content)
            .expect("failed: insert_adjacent_html");

        self.parent.append_child(&cloned_element).expect("failed: append_child");
    }

    pub fn append_search_result(&mut self, results: &JsValue, terms: &str) {
        let result: Vec<ResultObject> =
            serde_wasm_bindgen::from_value(results.into()).expect("Failed to deserialize JsValue to Vec<ResultObject>");

        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let mark = encode(&normalized_terms.join(" ")).into_owned().replace('\'', "%27");

        let mut id_cnt = RESULT_ID_START;

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

            let excerpt = self
                .teaser
                .search_result_excerpt(&el.doc.body, &normalized_terms, self.count);

            let score_bar = scoring_notation(el.score);

            self.add_element(&format!(
                r#"<a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div id="score" role="meter" aria-label="score:{}pt">{}</div>"#,
                &self.path_to_root, page, mark, head, el.doc.breadcrumbs, excerpt, el.score, score_bar),
                &id_cnt, page, &el.score
            );

            id_cnt += 1;
        });
    }
}
