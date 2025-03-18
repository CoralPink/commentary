use super::*;
use crate::searcher::function::*;
use crate::searcher::js_util::*;
use crate::searcher::score::*;

use arrayvec::ArrayVec;
use macros::error;
use serde_wasm_bindgen::from_value;
use urlencoding::encode;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;
use web_sys::{Element, HtmlElement, Node};

const INITIAL_HEADER: &str = "2文字 (もしくは全角1文字) 以上を入力してください...";

#[wasm_bindgen]
pub struct SearchResult {
    root_path: String,
    li_element: Element,
    parent: Element,
    header: Element,
    count: usize,
    url_table: Vec<String>,
    store_doc: Vec<DocObject>,
    limit: usize,
}

#[wasm_bindgen]
impl SearchResult {
    #[wasm_bindgen(constructor)]
    pub fn new(
        root_path: &str,
        count: usize,
        doc_urls: JsValue,
        docs: JsValue,
        limit: usize,
    ) -> Result<SearchResult, JsValue> {
        let window = web_sys::window().ok_or("No global `window` exists")?;
        let document = window.document().ok_or("Should have a document on window")?;

        let li_element = document.create_element("li").expect("failed: create <li>");

        li_element.set_attribute("tabindex", "0").expect("failed: set tabindex");
        li_element.set_attribute("role", "option").expect("failed: set role");

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
            .collect::<Result<_, _>>()
            .map_err(|e| JsValue::from_str(&format!("{:?}", e)))?;

        Ok(SearchResult {
            root_path: root_path.to_string(),
            li_element,
            parent,
            header,
            count,
            url_table,
            store_doc,
            limit,
        })
    }

    fn add_element(&self, content: &str, id: usize, page: &str, score: usize) {
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

    fn append_search_result(&self, results: Vec<ResultObject>, terms: &str) {
        let normalized_terms = terms
            .split_whitespace()
            .map(|t| t.to_lowercase())
            .collect::<Vec<String>>();

        let mark = encode(&normalized_terms.join(" ")).into_owned();

        let mut id_cnt = RESULT_ID_START;

        results.into_iter().for_each(|el| {
            let idx = match el.key.parse::<usize>() {
                Ok(n) => n,
                Err(_) => {
                    macros::console_error!("Error: Invalid result.ref: {}", el.key);
                    return;
                }
            };

            let mut tokens = ArrayVec::<HighlightedToken, ARRAY_VEC_SIZE>::new();

            let (page, head) = parse_uri(&self.url_table[idx]);
            let excerpt = search_result_excerpt(&mut tokens, &el.doc.body, self.count, &normalized_terms);
            let score_bar = scoring_notation(el.score);

            self.add_element(&format!(
                r#"<a href="{}{}?mark={}#{}" tabindex="-1">{}</a><span aria-hidden="true">{}</span><div id="score" role="meter" aria-label="score:{}pt">{}</div>"#,
                &self.root_path, page, mark, head, el.doc.breadcrumbs, excerpt, el.score, score_bar),
                id_cnt, page, el.score
            );

            id_cnt += 1;
        });
    }

    fn filter(&self, terms: &str) -> Vec<ResultObject> {
        let mut results: Vec<(ResultObject, usize)> = self
            .store_doc
            .iter()
            .filter_map(|doc| {
                let content = format!("{} {}", doc.title, doc.body);
                let score = calc_score(terms, &content);

                if score == 0 {
                    return None;
                }

                Some((
                    ResultObject {
                        doc: doc.clone(),
                        key: doc.id.clone(),
                        score,
                    },
                    content.find(terms).unwrap_or(content.len()),
                ))
            })
            .collect();

        results.sort_by(|a, b| b.0.score.cmp(&a.0.score).then_with(|| a.1.cmp(&b.1)));
        results.into_iter().map(|(result, _)| result).take(self.limit).collect()
    }

    pub fn search(&self, terms: &str) {
        if terms.is_empty() || (terms.len() <= 1 && is_full_width_or_ascii(terms)) {
            self.header.set_text_content(Some(INITIAL_HEADER));
            return;
        }

        let results = self.filter(terms);

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
