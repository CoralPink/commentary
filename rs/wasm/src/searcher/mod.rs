use js_sys::Array;
use wasm_bindgen::prelude::*;
use web_sys::{Document, Element};

pub mod teaser;
pub use crate::searcher::teaser::Teaser;

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

fn uri_parser(link_uri: &str) -> (&str, &str) {
    let uri: Vec<&str> = link_uri.split('#').collect();
    let head = if uri.len() > 1 { uri[1] } else { "" };

    (uri[0], head)
}

// TODO:
// I wanted to manipulate it by passing objects from js,
// but I just couldn't get it to work....
//
// I'll bring it up next time.
/*
#[allow(dead_code)]
#[wasm_bindgen]
pub struct DocObject {
    body: String,
    breadcrumbs: String,
    id: String,
    text: String,
    title: String,
}

#[allow(dead_code)]
#[wasm_bindgen]
pub struct SearchResult {
    doc: DocObject,
    reference: String,
    score: u32,
}
*/

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
        path_to_root: String,
        count: usize,
        doc_urls: Array,
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
            path_to_root,
            document,
            parent,
            count,
            teaser: Teaser::default(),
            url_table,
        })
    }

    pub fn append_search_result(
        &mut self,
        reference: &str,
        doc_body: &str,
        doc_breadcrumbs: &str,
        term: &str,
    ) {
        let idx = match reference.parse::<usize>() {
            Ok(n) => n,
            Err(_) => {
                console_error!("Error: Invalid result.ref: {reference}");
                return;
            }
        };
        let (page, head) = uri_parser(&self.url_table[idx]);
        let terms = term.split_whitespace().collect::<Vec<&str>>();

        let new_element = self
            .document
            .create_element("li")
            .expect("failed: create <li>");

        self.teaser.clear();

        new_element.set_inner_html(&format!(
          r#"<a href="{}{page}?highlight={}#{head}">{doc_breadcrumbs}</a><span class="teaser" aria-label="Search Result Teaser">{}</span>"#,
          &self.path_to_root,
          js_sys::encode_uri_component(&terms.join("%20"))
              .as_string()
              .unwrap_or_default()
              .replace('\'', "%27"),
          self.teaser.search_result_excerpt(
              doc_body,
              terms,
              self.count,
          )
        ));

        self.parent
            .append_child(&new_element)
            .expect("failed: append_child");
    }
}
