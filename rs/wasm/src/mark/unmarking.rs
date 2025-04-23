use macros::error;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn unmarking(elm: &web_sys::Element) {
    if let Ok(marks) = elm.query_selector_all("mark") {
        (0..marks.length())
            .filter_map(|i| marks.item(i))
            .filter_map(|node| node.parent_node().map(|parent| (node, parent)))
            .for_each(|(node, parent)| {
                while let Some(child) = node.first_child() {
                    if parent.insert_before(&child, Some(&node)).is_err() {
                        macros::console_error!("Failed to insert child");
                    }
                }
                if parent.remove_child(&node).is_err() {
                    macros::console_error!("Failed to remove <mark>");
                }
            });
    }
}
