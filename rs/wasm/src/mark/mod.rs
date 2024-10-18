use wasm_bindgen::prelude::*;
use web_sys::{Element, Node, NodeList};

use macros::error;

const NODE_TYPE: u16 = 3;

const MARK_TAG: &str = "<mark>";
const MARK_TAG_END: &str = "</mark>";

const EMPTY_STR: &str = "";

fn node_list_to_vec(node_list: NodeList) -> Result<Vec<Element>, String> {
    let mut vec = Vec::new();

    for i in 0..node_list.length() {
        if let Some(node) = node_list.item(i) {
            if let Some(el) = node.dyn_ref::<Element>() {
                vec.push(el.clone());
            } else {
                return Err(format!("Node at index {i} is not an Element"));
            }
        }
    }

    Ok(vec)
}

fn mark_up_text(node: &Node, terms: &str) {
    if let Some(elm) = node.parent_element() {
        let inner = elm.inner_html();

        // I'm making a very out-of-the-box decision.
        // However, at present, I don't see any better solution....
        if inner.as_str().trim_start().starts_with('<') {
            return;
        }

        let marked = terms.split_whitespace().fold(inner, |acc, term| {
            acc.replace(term, &format!("{MARK_TAG}{term}{MARK_TAG_END}"))
        });

        elm.set_inner_html(&marked);
    }
}

fn process_nodes(node: &Node, terms: &str) {
    if let Some(elm) = node.dyn_ref::<Element>() {
        if let Some(last) = elm
            .child_nodes()
            .item(elm.child_nodes().length().wrapping_sub(1))
        {
            if last.node_type() == NODE_TYPE {
                mark_up_text(&last, terms);
            }
        }
    }
}

fn get_article_content() -> Result<Element, String> {
    let window = web_sys::window().ok_or("window not available")?;
    let document = window.document().ok_or("document not available")?;

    let article = document
        .get_element_by_id("article")
        .ok_or("Element with id 'article' not found")?;

    Ok(article)
}

#[wasm_bindgen]
pub fn marking(terms: &str) {
    match get_article_content() {
        Ok(article) => {
            let node_list = article.query_selector_all("*").expect("Failed: marking");

            match node_list_to_vec(node_list) {
                Ok(nodes) => {
                    for node in nodes {
                        process_nodes(&node, terms);
                    }
                }
                Err(err) => {
                    macros::console_error!("marking: {err}");
                }
            }
        }
        Err(err) => {
            macros::console_error!("marking: {err}");
        }
    }
}

#[wasm_bindgen]
pub fn unmarking() {
    match get_article_content() {
        Ok(article) => {
            let html = article
                .inner_html()
                .replace(MARK_TAG, EMPTY_STR)
                .replace(MARK_TAG_END, EMPTY_STR);

            article.set_inner_html(&html);
        }
        Err(err) => {
            macros::console_error!("unmarking: {err}");
        }
    }
}
