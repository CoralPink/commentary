use js_sys::Array;
use rust_stemmers::{Algorithm, Stemmer};
use wasm_bindgen::prelude::*;
use web_sys::{Document, Element};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
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
const TERM_WEIGHT: u32 = 40;

struct Teaser {
    vec: Vec<(String, u32, usize)>,
    found: bool,
}

impl Teaser {
    fn new() -> Self {
        Teaser {
            vec: Vec::new(),
            found: false,
        }
    }

    fn clear(&mut self) {
        self.vec.clear();
        self.found = false;
    }

    fn window_weight(&self, end: usize) -> Vec<u32> {
        let mut ret = Vec::new();
        let mut sum = 0;

        for x in self.vec.iter().take(end) {
            sum += x.1;
        }

        ret.push(sum);

        for i in 0..self.vec.len() - end {
            sum -= self.vec[i].1;
            sum += self.vec[i + end].1;

            ret.push(sum);
        }
        ret
    }

    fn calc_range(&self, count: usize) -> (usize, usize) {
        let end = std::cmp::min(self.vec.len(), count);

        if !self.found {
            return (0, end);
        }

        let mut start = 0;
        let mut max_sum = 0;

        let window = self.window_weight(end);

        for i in (0..window.len()).rev() {
            if window[i] > max_sum {
                max_sum = window[i];
                start = i;
            }
        }

        (start, end)
    }

    fn highlighting(&self, body: &str, count: usize) -> String {
        if self.vec.is_empty() {
            return body.to_string();
        }

        let range = self.calc_range(count);

        let mut highlight = Vec::new();
        let mut index = self.vec[range.0].2;

        for word in self.vec.iter().skip(range.0).take(range.1) {
            // missing text from index to the start of `word`
            if index < word.2 {
                highlight.push(&body[index..word.2]);
                index = word.2;
            }

            if word.1 != TERM_WEIGHT {
                highlight.push(&body[word.2..index + word.0.len()]);
            } else {
                highlight.push("<em>");
                highlight.push(&body[word.2..index + word.0.len()]);
                highlight.push("</em>");
            }

            index = word.2 + word.0.len();
        }

        highlight.join("")
    }

    fn search_result_excerpt(&mut self, body: &str, terms: Vec<&str>, count: usize) -> String {
        let mut idx = 0;

        for whole in body.to_lowercase().split(". ") {
            let words: Vec<&str> = whole.split(' ').collect();
            let mut value = 8;

            for separate in words {
                if !separate.is_empty() {
                    let stemmed = Stemmer::create(Algorithm::English).stem(separate);

                    for term in terms
                        .iter()
                        .map(|w| Stemmer::create(Algorithm::English).stem(w))
                    {
                        if stemmed.starts_with(&term.to_lowercase()) {
                            value = TERM_WEIGHT;
                            self.found = true;
                        }
                    }
                    self.vec.push((separate.to_string(), value, idx));
                    value = 2;
                }
                idx += separate.len();
                idx += 1; // ' ' or '.' if the last word in the sentence
            }

            idx += 1; // because we split at a two-char boundary '. '
        }

        self.highlighting(body, count)
    }
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
            teaser: Teaser::new(),
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
        let (page, head) = uri_parser(&self.url_table[reference.parse::<usize>().expect("failed: result.ref")]);
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
