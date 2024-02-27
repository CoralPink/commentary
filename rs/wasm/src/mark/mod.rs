use wasm_bindgen::prelude::*;
use web_sys::{Element, Node, NodeList};

const NODE_TYPE: u16 = 3;

const MARK_TAG: &str = "<mark>";
const MARK_END_TAG: &str = "</mark>";
const EMPTY_STR: &str = "";

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

macro_rules! console_error {
    ($($t:tt)*) => (error(&format!($($t)*)))
}

fn node_list_to_vec(node_list: NodeList) -> Result<Vec<Element>, String> {
    let mut vec = Vec::new();

    for i in 0..node_list.length() {
        if let Some(node) = node_list.item(i) {
            if let Some(el) = node.dyn_ref::<Element>() {
                vec.push(el.clone());
            } else {
                return Err(format!("Node at index {} is not an Element", i));
            }
        }
    }

    Ok(vec)
}

fn replace(node: &Node, term: &str) {
    if let Some(elm) = node.parent_element() {
        if elm.tag_name() == "MARK" {
            return;
        }

        let inner = elm.inner_html();

        // I'm making a very out-of-the-box decision.
        // However, at present, I don't see any better solution....
        if inner.as_str().trim_start().starts_with('<') {
            return;
        }

        let marked = term.split_whitespace().fold(inner.clone(), |acc, word| {
            acc.replace(word, &format!("{MARK_TAG}{word}{MARK_END_TAG}"))
        });

        elm.set_inner_html(&marked);
    }
}

fn process_nodes(node: &Node, term: &str) {
    if let Some(elm) = node.dyn_ref::<Element>() {
        if let Some(last) = elm
            .child_nodes()
            .item(elm.child_nodes().length().wrapping_sub(1))
        {
            if last.node_type() == NODE_TYPE {
                replace(&last, term);
            }
        }
    }
}

#[wasm_bindgen]
pub fn marking(term: &str) {
    let window = web_sys::window().expect("window not available");
    let document = window.document().expect("document not available");

    if let Some(main) = document.get_element_by_id("main") {
        let node_list = main.query_selector_all("*").expect("Failed: marking");

        match node_list_to_vec(node_list) {
            Ok(nodes) => {
                for node in nodes {
                    process_nodes(&node, term);
                }
            }
            Err(err) => {
                console_error!("{}", &err);
            }
        }
    }
}

#[wasm_bindgen]
pub fn unmarking(str: &str) -> String {
    str.replace(MARK_TAG, EMPTY_STR)
        .replace(MARK_END_TAG, EMPTY_STR)
}
