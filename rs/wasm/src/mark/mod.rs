use wasm_bindgen::prelude::*;
use web_sys::{Element, Node, NodeList};

const NODE_TYPE: u16 = 3;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// I'm making a very out-of-the-box decision.
// However, at present, I don't see any better solution....
fn is_text(input: &str) -> bool {
    !input.trim_start().starts_with('<')
}

fn replace(node: &Node, term: &str) {
    if let Some(elm) = node.parent_element() {
        if elm.tag_name() == "MARK" {
            return;
        }

        let inner = elm.inner_html();

        if is_text(inner.as_str()) {
            if inner.contains("<mark>") {
                return;
            }
            let marked = term.split_whitespace().fold(inner.clone(), |acc, word| {
                acc.replace(word, &format!("<mark>{}</mark>", word))
            });

            elm.set_inner_html(&marked);
        }
    }
}

fn process_nodes(node: &Node, term: &str) {
    if node.node_type() == NODE_TYPE {
        replace(node, term);
        return;
    }

    if let Some(elm) = node.dyn_ref::<Element>() {
        for i in 0..elm.child_nodes().length() {
            if let Some(child) = elm.child_nodes().item(i) {
                process_nodes(&child, term);
            }
        }
    }
}

fn node_list_to_vec(node_list: NodeList) -> Vec<Element> {
    let mut vec = Vec::new();

    for i in 0..node_list.length() {
        if let Some(node) = node_list.item(i) {
            if let Some(el) = node.dyn_ref::<Element>() {
                vec.push(el.clone());
            }
        }
    }
    vec
}

#[wasm_bindgen]
pub fn marking(term: &str) {
    let window = web_sys::window().expect("window not available");
    let document = window.document().expect("document not available");

    if let Some(main) = document.get_element_by_id("main") {
        for node in node_list_to_vec(
            main.query_selector_all("*")
                .expect("Failed to query elements"),
        ) {
            process_nodes(&node, term);
        }
    }
}

#[wasm_bindgen]
pub fn unmarking(str: &str) -> String {
    str.replace("<mark>", "").replace("</mark>", "")
}
