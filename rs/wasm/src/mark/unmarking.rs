use super::*;
use crate::mark::article::with_article_nodes;

use macros::error;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn unmarking() {
    with_article_nodes(TAG_MARK, |node| {
        if let Some(parent) = node.parent_node() {
            while let Some(child) = node.first_child() {
                if parent.insert_before(&child, Some(&node)).is_err() {
                    macros::console_error!("Failed to insert child");
                }
            }

            if parent.remove_child(&node).is_err() {
                macros::console_error!("Failed to remove <{TAG_MARK}>");
            }
        }
    });
}
