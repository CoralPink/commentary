use super::*;

use html_escape::encode_safe;
use wasm_bindgen::prelude::*;
use web_sys::{Document, Element, Node};

enum Fragment<'a> {
    Text(&'a str),
    Mark(&'a str),
}

fn split_text_with_matches<'a>(text: &'a str, terms: &[&str]) -> Option<Vec<Fragment<'a>>> {
    let lower_text = text.to_lowercase();
    let mut ranges = vec![];

    for term in terms {
        let mut start = 0;

        while let Some(pos) = lower_text[start..].find(term) {
            let abs_pos = start + pos;
            ranges.push((abs_pos, abs_pos + term.len()));
            start = abs_pos + term.len();
        }
    }

    if ranges.is_empty() {
        return None;
    }

    ranges.sort_by_key(|r| r.0);

    let mut merged: Vec<(usize, usize)> = vec![];

    for (start, end) in ranges {
        if let Some((_, last_end)) = merged.last_mut() {
            if *last_end >= start {
                *last_end = (*last_end).max(end);
                continue;
            }
        }
        merged.push((start, end));
    }

    let mut fragments: Vec<Fragment> = vec![];
    let mut last = 0;

    for (start, end) in merged {
        if last < start {
            fragments.push(Fragment::Text(&text[last..start]));
        }
        fragments.push(Fragment::Mark(&text[start..end]));
        last = end;
    }

    if last < text.len() {
        fragments.push(Fragment::Text(&text[last..]));
    }

    Some(fragments)
}

fn highlight_text_nodes(document: &Document, element: &Element, terms: &[&str]) {
    let mut child = element.first_child();

    while let Some(node) = child {
        child = node.next_sibling();

        match node.node_type() {
            Node::TEXT_NODE => {
                let text = node.node_value().unwrap_or_default();

                if let Some(fragments) = split_text_with_matches(&text, terms) {
                    let parent = node.parent_node().unwrap();
                    parent.remove_child(&node).unwrap();

                    for frag in fragments {
                        match frag {
                            Fragment::Text(s) => {
                                let n = document.create_text_node(s);
                                parent.append_child(&n).unwrap();
                            }
                            Fragment::Mark(s) => {
                                let m = document.create_element(TAG_MARK).unwrap();
                                m.set_text_content(Some(s));
                                parent.append_child(&m).unwrap();
                            }
                        }
                    }
                }
            }
            Node::ELEMENT_NODE => {
                if let Some(child_el) = node.dyn_ref::<Element>() {
                    highlight_text_nodes(document, child_el, terms);
                }
            }
            _ => {}
        }
    }
}

#[wasm_bindgen]
pub fn marking(elm: &Element, params: &str) {
    let encoded = encode_safe(params);
    let terms: Vec<&str> = encoded.split_whitespace().collect();

    highlight_text_nodes(&elm.owner_document().unwrap(), elm, &terms);
}
