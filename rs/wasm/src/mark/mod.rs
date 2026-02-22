use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use unicode_segmentation::UnicodeSegmentation;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct RangeIndex {
    start: usize,
    end: usize,
    #[cfg(test)]
    matched: String,
    #[cfg(test)]
    term: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct MatchResult {
    index: Vec<RangeIndex>,
    had_match: bool,
}

fn create_index_map(text: &str) -> Vec<usize> {
    let mut v = vec![0; text.len() + 1];

    let mut byte_idx = 0;
    let mut utf16_idx = 0;

    for c in text.chars() {
        let utf8_len = c.len_utf8();
        let utf16_len = c.encode_utf16(&mut [0; 2]).len();

        for i in 0..utf8_len {
            v[byte_idx + i] = utf16_idx;
        }
        byte_idx += utf8_len;
        utf16_idx += utf16_len;
    }
    v[byte_idx] = utf16_idx;

    v
}

fn get_sentences(terms: Vec<&str>, text: &str, index_map: Vec<usize>) -> Vec<RangeIndex> {
    let mut index = Vec::new();

    for sentence in text.unicode_sentences() {
        let sent_start = text.find(sentence).unwrap_or(0);
        let lower_sentence = sentence.to_lowercase();

        if terms.iter().any(|term| lower_sentence.contains(&term.to_lowercase())) {
            let sent_end = sent_start + sentence.len();

            index.push(RangeIndex {
                start: index_map[sent_start],
                end: index_map[sent_end],
                #[cfg(test)]
                matched: sentence.to_string(),
                #[cfg(test)]
                term: terms.join(" "),
            });
        }
    }

    index
}

fn get_range(terms: Vec<&str>, text: &str, index_map: Vec<usize>) -> Vec<RangeIndex> {
    let mut index = Vec::new();

    for x in &terms {
        let lower_term = x.to_lowercase();
        let mut pos = 0;

        while let Some(found) = text[pos..].find(&lower_term) {
            let l = pos + found;

            let len: usize = x.chars().map(|c| c.len_utf8()).sum();
            let r = l + len;

            index.push(RangeIndex {
                start: index_map[l],
                end: index_map[r],
                #[cfg(test)]
                matched: text[l..r].to_string(),
                #[cfg(test)]
                term: (*x).to_string(),
            });

            pos = r;
        }
    }

    index
}

#[wasm_bindgen]
pub fn get_match_range(terms: &str, text: &str, range: bool) -> JsValue {
    let index_map = create_index_map(text);
    let lower_text = text.to_lowercase();

    let terms: Vec<&str> = terms.split_whitespace().collect();
    let mut index = if range {
        get_sentences(terms, &lower_text, index_map)
    } else {
        get_range(terms, &lower_text, index_map)
    };

    index.sort_by_key(|r| r.start);

    let had_match = !index.is_empty();
    let match_index = MatchResult { index, had_match };

    to_value(&match_index).unwrap()
}

/*
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
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 1);

        let first = &parsed.index[0];
        assert_eq!(first.term, "Rust");
        assert_eq!(first.matched, "Rust");
        assert!(first.start < first.end);
    }

    #[wasm_bindgen_test]
    fn test_case_insensitive_matching() {
        let text = "Rust rust RUST";
        let terms = "rust";
        let parsed: MatchResult = from_value(get_match_range(terms, text)).unwrap();
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 3);
        let matched_terms: Vec<_> = parsed.index.iter().map(|r| r.matched.clone()).collect();
        assert_eq!(
            matched_terms,
            vec!["Rust".to_string(), "rust".to_string(), "RUST".to_string()]
        );
    }

    #[wasm_bindgen_test]
    fn test_unicode_accented_characters() {
        let text = "Café au lait";
        let terms = "café";
        let parsed: MatchResult = from_value(get_match_range(terms, text)).unwrap();
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
        let terms = "😊";
        let parsed: MatchResult = from_value(get_match_range(terms, text)).unwrap();
        assert!(parsed.had_match);
        assert_eq!(parsed.index.len(), 2);
        assert_eq!(parsed.index[0].matched, "😊");
        assert_eq!(parsed.index[1].matched, "😊");
        // Ensure UTF-16 indices increase
        assert!(parsed.index[0].start < parsed.index[1].start);
    }

    #[wasm_bindgen_test]
    fn test_multiple_search_terms() {
        let text = "foo bar baz foo";
        let terms = "foo baz";
        let parsed: MatchResult = from_value(get_match_range(terms, text)).unwrap();
        assert!(parsed.had_match);
        // Should find two 'foo' and one 'baz'
        assert_eq!(parsed.index.iter().filter(|r| r.term == "foo").count(), 2);
        assert_eq!(parsed.index.iter().filter(|r| r.term == "baz").count(), 1);
    }

    #[wasm_bindgen_test]
    fn test_overlapping_matches() {
        let text = "ababa";
        let terms = "aba";
        let parsed: MatchResult = from_value(get_match_range(terms, text)).unwrap();
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
        let parsed_empty_text: MatchResult = from_value(get_match_range("rust", "")).unwrap();
        assert!(!parsed_empty_text.had_match);
        assert_eq!(parsed_empty_text.index.len(), 0);
        // Empty terms
        let parsed_empty_terms: MatchResult = from_value(get_match_range("", "Rust")).unwrap();
        assert!(!parsed_empty_terms.had_match);
        assert_eq!(parsed_empty_terms.index.len(), 0);
        // Whitespace-only terms
        let parsed_whitespace: MatchResult = from_value(get_match_range("   ", "Rust")).unwrap();
        assert!(!parsed_whitespace.had_match);
    }
}
*/
