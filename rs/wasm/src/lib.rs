use js_sys::Array;
use wasm_bindgen::prelude::*;
use web_sys::{Element, NodeList};

fn node_list_to_array(node_list: NodeList) -> Array {
    Array::from(&node_list)
}

#[wasm_bindgen]
pub fn attribute_external_links() {
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();

    let elements = document
        .query_selector_all(r#".content main a[href^="http"]"#)
        .unwrap();

    for el in node_list_to_array(elements).iter() {
        if let Some(el) = el.dyn_ref::<Element>() {
            el.set_attribute("target", "_blank").unwrap();
            el.set_attribute("rel", "noopener").unwrap();
        }
    }
}
