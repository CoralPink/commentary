use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use std::mem::MaybeUninit;
use unicode_segmentation::UnicodeSegmentation;
use wasm_bindgen::prelude::*;

/// rough guide to the number of RangeIndex
const RANGE_INDEX_ROUGH_GUIDE: usize = 8;

#[derive(Serialize, Deserialize)]
struct RangeIndex {
    start: usize,
    end: usize,
    #[cfg(test)]
    matched: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MatchResult {
    index: Vec<RangeIndex>,
    had_match: bool,
}

fn create_index_map(text: &str) -> Vec<usize> {
    let v_size = text.len() + 1;

    let mut v: Vec<usize> = Vec::with_capacity(v_size);
    let spare: &mut [MaybeUninit<usize>] = v.spare_capacity_mut();

    let mut utf16_idx = 0;
    let mut byte_idx = 0;

    for c in text.chars() {
        let utf8_len = c.len_utf8();

        for i in 0..utf8_len {
            spare[byte_idx + i].write(utf16_idx);
        }

        byte_idx += utf8_len;
        utf16_idx += c.encode_utf16(&mut [0; 2]).len();
    }

    spare[byte_idx].write(utf16_idx);

    // SAFETY: All positions 0..v_size are initialized:
    // - The inner loop writes spare[byte_idx + i] for each byte of every character
    // - After the loop, byte_idx == text.len() and spare[byte_idx] is written explicitly
    // - Thus all v_size (= text.len() + 1) elements are initialized before set_len
    unsafe {
        v.set_len(v_size);
    }

    v
}

fn merge_ranges(range: Vec<RangeIndex>) -> Vec<RangeIndex> {
    let mut merged: Vec<RangeIndex> = Vec::with_capacity(range.len());

    for r in range {
        if let Some(last) = merged.last_mut()
            && r.start <= last.end
        {
            last.end = last.end.max(r.end);
            continue;
        }
        merged.push(r);
    }

    merged
}

fn get_sentences(terms: &[String], text: &str, index_map: &[usize]) -> Vec<RangeIndex> {
    let mut range = Vec::with_capacity(index_map.len() / RANGE_INDEX_ROUGH_GUIDE);
    let mut cursor = 0;

    for sentence in text.unicode_sentences() {
        let Some(rel) = text[cursor..].find(sentence) else {
            continue;
        };

        let p = cursor + rel;
        cursor = p + sentence.len();

        if terms.iter().any(|x| sentence.to_lowercase().contains(x)) {
            range.push(RangeIndex {
                start: index_map[p],
                end: index_map[p + sentence.len()],
                #[cfg(test)]
                matched: sentence.to_string(),
            });
        }
    }

    merge_ranges(range)
}

fn get_range(terms: &[String], text: &str, index_map: &[usize]) -> Vec<RangeIndex> {
    let lower_text = text.to_lowercase();
    let mut range = Vec::with_capacity(index_map.len() / RANGE_INDEX_ROUGH_GUIDE);

    for x in terms {
        let mut pos = 0;

        while let Some(found) = lower_text[pos..].find(x) {
            let byte_start = pos + found;
            let byte_end = byte_start + x.len();

            range.push(RangeIndex {
                start: index_map[byte_start],
                end: index_map[byte_end],
                #[cfg(test)]
                matched: text[byte_start..byte_end].to_string(),
            });

            pos = byte_end;
        }
    }

    range.sort_unstable_by_key(|r| r.start);

    range
}

fn build_match_result<F>(term: &str, text: &str, matcher: F) -> Result<JsValue, JsValue>
where
    F: Fn(&[String], &str, &[usize]) -> Vec<RangeIndex>,
{
    let terms: Vec<String> = term.split_whitespace().map(|t| t.to_lowercase()).collect();

    let index = matcher(&terms, text, &create_index_map(text));
    let had_match = !index.is_empty();

    to_value(&MatchResult { index, had_match }).map_err(|e| JsValue::from_str(&e.to_string()))
}

// NOTE: Not currently in use
//#[wasm_bindgen]
pub fn get_match_range(term: &str, text: &str) -> Result<JsValue, JsValue> {
    build_match_result(term, text, get_range)
}

#[wasm_bindgen]
pub fn get_match_sentences(term: &str, text: &str) -> Result<JsValue, JsValue> {
    build_match_result(term, text, get_sentences)
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
        let term = "Rust";

        let result = get_match_range(term, text).unwrap();

        let parsed: MatchResult = from_value(result).unwrap();
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 1);

        let first = &parsed.index[0];
        assert_eq!(first.matched, "Rust");
        assert_eq!(&text[first.start..first.end], first.matched);
    }

    #[wasm_bindgen_test]
    fn test_case_insensitive_matching() {
        let text = "Rust rust RUST";
        let term = "rust";
        let parsed: MatchResult = from_value(get_match_range(term, text).unwrap()).unwrap();
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 3);
        let matched_term: Vec<_> = parsed.index.iter().map(|r| r.matched.clone()).collect();
        assert_eq!(
            matched_term,
            vec!["Rust".to_string(), "rust".to_string(), "RUST".to_string()]
        );
    }

    #[wasm_bindgen_test]
    fn test_unicode_accented_characters() {
        let text = "Café au lait";
        let term = "café";
        let parsed: MatchResult = from_value(get_match_range(term, text).unwrap()).unwrap();
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 1);
        let first = &parsed.index[0];
        assert_eq!(first.matched, "Café");
        assert_eq!(first.start, 0);
        assert_eq!(first.end, 4);
    }

    #[wasm_bindgen_test]
    fn test_unicode_emoji_surrogate_pairs() {
        let text = "😊😊";
        let term = "😊";
        let parsed: MatchResult = from_value(get_match_range(term, text).unwrap()).unwrap();
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 2);
        assert_eq!(parsed.index[0].matched, "😊");
        assert_eq!(parsed.index[1].matched, "😊");
        // Ensure UTF-16 indices increase
        assert!(parsed.index[0].start < parsed.index[1].start);
    }

    #[wasm_bindgen_test]
    fn test_multiple_search_term() {
        let text = "foo bar baz foo";
        let term = "foo baz";
        let parsed: MatchResult = from_value(get_match_range(term, text).unwrap()).unwrap();
        assert!(parsed.had_match);
        // Should find two 'foo' and one 'baz'
        let mut matched: Vec<_> = parsed.index.iter().map(|r| r.matched.clone()).collect();
        matched.sort();
        assert_eq!(matched, vec!["baz", "foo", "foo"]);
    }

    #[wasm_bindgen_test]
    fn test_overlapping_matches() {
        let text = "ababa";
        let term = "aba";
        let parsed: MatchResult = from_value(get_match_range(term, text).unwrap()).unwrap();
        assert!(parsed.had_match);
        // current implementation finds non-overlapping matches only
        assert_eq!(parsed.index.len(), 1);
        assert_eq!(parsed.index[0].matched, "aba");
        assert_eq!(parsed.index[0].start, 0);
        assert_eq!(parsed.index[0].end, 3);
    }

    #[wasm_bindgen_test]
    fn test_empty_and_whitespace_inputs() {
        // Empty text
        let parsed_empty_text: MatchResult = from_value(get_match_range("rust", "").unwrap()).unwrap();
        assert!(!parsed_empty_text.had_match);
        assert_eq!(parsed_empty_text.index.len(), 0);
        // Empty term
        let parsed_empty_term: MatchResult = from_value(get_match_range("", "Rust").unwrap()).unwrap();
        assert!(!parsed_empty_term.had_match);
        assert_eq!(parsed_empty_term.index.len(), 0);
        // Whitespace-only term
        let parsed_whitespace: MatchResult = from_value(get_match_range("   ", "Rust").unwrap()).unwrap();
        assert!(!parsed_whitespace.had_match);
    }
}
