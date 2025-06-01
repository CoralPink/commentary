use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct RangeIndex {
    start: usize,
    end: usize,
    matched: String,
    term: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MatchResult {
    index: Vec<RangeIndex>,
    had_match: bool,
}

#[wasm_bindgen]
pub fn get_match_range(terms: &str, text: &str) -> JsValue {
    let mut byte_to_utf16 = vec![0; text.len() + 1];
    let mut utf16_index = 0;
    let mut byte_index = 0;

    for c in text.chars() {
        let utf8_len = c.len_utf8();
        let utf16_len = c.encode_utf16(&mut [0; 2]).len();

        for i in 0..utf8_len {
            byte_to_utf16[byte_index + i] = utf16_index;
        }
        byte_index += utf8_len;
        utf16_index += utf16_len;
    }

    let terms: Vec<&str> = terms.split_whitespace().collect();
    let lower_text = text.to_lowercase();

    let mut index = Vec::new();

    for term in &terms {
        let lower_term = term.to_lowercase();
        let mut pos = 0;

        while let Some(found) = lower_text[pos..].find(&lower_term) {
            let byte_start = pos + found;
            let byte_end = byte_start + term.len();

            let matched = text[byte_start..]
                .chars()
                .take(term.chars().count())
                .collect::<String>();

            index.push(RangeIndex {
                start: byte_to_utf16[byte_start],
                end: byte_to_utf16[byte_end - 1] + 1,
                matched,
                term: (*term).to_string(),
            });

            pos = byte_end;
        }
    }

    index.sort_by_key(|r| r.start);

    let had_match = !index.is_empty();
    let match_index = MatchResult { index, had_match };

    to_value(&match_index).unwrap()
}

#[cfg(test)]
#[allow(dead_code)]
mod tests {
    use super::*;
    use serde_wasm_bindgen::from_value;
    use wasm_bindgen_test::*;

    wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_get_match_range_basic() {
        let text = "Hello Rust World!";
        let terms = "Rust";

        let result = get_match_range(terms, text);

        let parsed: MatchResult = from_value(result).unwrap();
        assert_eq!(parsed.had_match, true);
        assert_eq!(parsed.index.len(), 1);

        let first = &parsed.index[0];
        assert_eq!(first.term, "Rust");
        assert_eq!(first.matched, "Rust");
        assert_eq!(first.start < first.end, true);
    }
}
