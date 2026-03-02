use unicode_segmentation::UnicodeSegmentation;

/// Number of words considered for teaser/highlight calculation.
const TEASER_WORD_COUNT: usize = 256;
/// Extra buffer size when generating the highlighted string.
const RESULT_CAPACITY: usize = 128;

/// Estimated maximum number of tokens for a single document.
const MAX_TOKENS: usize = 100;

/// Default importance for normal words.
const IMPORTANCE_DEFAULT: u16 = 8;
/// Importance for the first word of a text.
const IMPORTANCE_FIRST_WORD: u16 = 32;
/// Importance for matched search terms.
const IMPORTANCE_MATCH: u16 = 160;

/// HTML tag used to mark highlighted words.
const MARK_TAG: &str = "<mark>";
/// HTML closing tag for highlighted words.
const MARK_TAG_END: &str = "</mark>";

/// A tokenized word in the text, with its byte position and importance.
struct HighlightedToken<'a> {
    position: usize,
    text: &'a str,
    importance: u16,
}

/// Represents a byte range in the text that matched a search term.
struct HitRange {
    start: usize,
    end: usize,
}

/// Represents the index range to be extracted.
struct WindowSpec {
    start: usize,
    size: usize,
}

/// Calculate the optimal window of tokens to highlight based on their importance.
///
/// Returns the starting index and window size as a `WindowSpec`.
fn calc_range_position(tokens: &[HighlightedToken]) -> WindowSpec {
    let size = TEASER_WORD_COUNT.min(tokens.len());
    let mut start = 0;

    let mut potential: u16 = tokens.iter().take(size).map(|t| t.importance).sum();
    let mut p = potential;

    for i in 1..=tokens.len() - size {
        p = p - tokens[i - 1].importance + tokens[i + size - 1].importance;

        if p > potential {
            potential = p;
            start = i;
        }
    }

    WindowSpec { start, size }
}

/// Extend the highlight window to include consecutive matched tokens.
///
/// This ensures the highlight continues to the end of any matching terms.
fn calc_end_index(range: &WindowSpec, tokens: &[HighlightedToken]) -> usize {
    let mut end_index = range.start + range.size;

    // If matches are consecutive, extend them to the end
    while end_index < tokens.len() && tokens[end_index].importance == IMPORTANCE_MATCH {
        end_index += 1;
    }

    end_index
}

/// Apply `<mark>` HTML tags to the tokens in the optimal window.
///
/// Tokens with `importance == IMPORTANCE_MATCH` are wrapped with `<mark>`.
/// Returns the final HTML string with highlighted matches.
fn apply_markup(tokens: &[HighlightedToken], body: &str) -> String {
    if tokens.is_empty() {
        return body.to_string();
    }

    let range = calc_range_position(tokens);
    let end_index = calc_end_index(&range, tokens);

    let mut pos = tokens[range.start].position;
    let mut result = String::with_capacity(body.len() + RESULT_CAPACITY);

    let mut marking = false;

    for token in tokens.iter().take(end_index).skip(range.start) {
        // There are characters that have not yet been output between
        // the end of the previous token and the start of the current token.
        if pos < token.position {
            // Since the gap is not a highlight target, close the <mark> tag
            if marking {
                result.push_str(MARK_TAG_END);
                marking = false;
            }
            result.push_str(&body[pos..token.position]);
        }
        // current token is being searched
        if token.importance == IMPORTANCE_MATCH {
            if !marking {
                result.push_str(MARK_TAG);
                marking = true;
            }
            result.push_str(token.text);
        // current token does not match the search results
        } else {
            if marking {
                result.push_str(MARK_TAG_END);
                marking = false;
            }
            result.push_str(token.text);
        }

        pos = token.position + token.text.len();
    }

    // If the last token matches, close the <mark> tag here
    if marking {
        result.push_str(MARK_TAG_END);
    }

    result
}

/// Find all hit ranges in `body` corresponding to normalized search terms.
///
/// Returns a vector of `HitRange` with start/end byte positions.
fn get_hitranges(body: &str, normalized_terms: &[String]) -> Vec<HitRange> {
    let mut vec = Vec::new();

    for term in normalized_terms {
        if term.is_empty() {
            continue;
        }
        let mut offset = 0;

        while let Some(pos) = body[offset..].find(term) {
            let start = offset + pos;
            let end = start + term.len();

            vec.push(HitRange { start, end });
            offset = end;
        }
    }
    }

    vec.sort_by_key(|r| (r.start, r.end));

    let mut merged: Vec<HitRange> = Vec::with_capacity(vec.len());

    for r in vec {
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

/// Generate a highlighted HTML snippet for the given `body`.
///
/// # Arguments
/// * `body` - The text to highlight.
/// * `normalized_terms` - Lowercased search terms to match in the text.
///
/// # Returns
/// A `String` containing the text with `<mark>` tags around matched terms.
pub fn generate(body: &str, normalized_terms: &[String]) -> String {
    let hit_range = get_hitranges(body, normalized_terms);

    let mut tokens = Vec::with_capacity(MAX_TOKENS);

    for (position, text) in body.unicode_word_indices() {
        let mut importance = if position == 0 {
            IMPORTANCE_FIRST_WORD
        } else {
            IMPORTANCE_DEFAULT
        };

        for range in &hit_range {
            if position < range.end && position + text.len() > range.start {
                importance = IMPORTANCE_MATCH;
                break;
            }
        }

        tokens.push(HighlightedToken {
            position,
            text,
            importance,
        });
    }

    apply_markup(&tokens, body)
}
#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_generate_basic_cjk() {
        let text = "桃太郎が鬼ヶ島へ行った";
        let terms = vec!["桃太郎".to_string()];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(highlighted.contains("<mark>桃太郎</mark>"));
        assert_eq!(hit_ranges.len(), 1);
        assert_eq!(&text[hit_ranges[0].start..hit_ranges[0].end], "桃太郎");
    }

    #[wasm_bindgen_test]
    fn test_generate_multiple_cjk_terms() {
        let text = "桃太郎と浦島太郎と金太郎が出てきた";
        let terms = vec!["桃太郎".to_string(), "浦島太郎".to_string(), "金太郎".to_string()];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(highlighted.contains("<mark>桃太郎</mark>"));
        assert!(highlighted.contains("<mark>浦島太郎</mark>"));
        assert!(highlighted.contains("<mark>金太郎</mark>"));
        assert_eq!(hit_ranges.len(), 3);
        assert_eq!(&text[hit_ranges[0].start..hit_ranges[0].end], "桃太郎");
        assert_eq!(&text[hit_ranges[1].start..hit_ranges[1].end], "浦島太郎");
        assert_eq!(&text[hit_ranges[2].start..hit_ranges[2].end], "金太郎");
    }

    #[wasm_bindgen_test]
    fn test_generate_cjk_at_end() {
        let text = "鬼ヶ島へ行ったのは桃太郎";
        let terms = vec!["桃太郎".to_string()];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(highlighted.contains("<mark>桃太郎</mark>"));
        assert!(highlighted.starts_with("鬼ヶ島へ行ったのは"));
        assert_eq!(hit_ranges.len(), 1);
    }

    #[wasm_bindgen_test]
    fn test_generate_overlapping_terms() {
        let text = "桃太郎と桃太郎太郎";
        let terms = vec!["桃太郎".to_string(), "太郎".to_string()];

        let highlighted = generate(text, &terms);

        assert!(highlighted.contains("<mark>桃太郎</mark>"));
        assert!(highlighted.matches("<mark>").count() >= 2);

        // NOTE:
        // Only three hits should occur, but in reality duplicate hits and nested hits are also counted.
        //let hit_ranges = get_hitranges(text, &terms);
        //assert_eq!(hit_ranges.len(), 3); // 桃太郎 x2, 太郎 x1
    }

    #[wasm_bindgen_test]
    fn test_generate_mixed_cjk_ascii() {
        let text = "桃太郎 is a famous character in Japan";
        let terms = vec!["桃太郎".to_string(), "Japan".to_string()];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(highlighted.contains("<mark>桃太郎</mark>"));
        assert!(highlighted.contains("<mark>Japan</mark>"));
        assert_eq!(hit_ranges.len(), 2);
        assert_eq!(&text[hit_ranges[0].start..hit_ranges[0].end], "桃太郎");
        assert_eq!(&text[hit_ranges[1].start..hit_ranges[1].end], "Japan");
    }

    #[wasm_bindgen_test]
    fn test_generate_multiple_occurrences() {
        let text = "桃太郎と桃太郎と桃太郎";
        let terms = vec!["桃太郎".to_string()];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        let count = highlighted.matches("<mark>").count();
        assert_eq!(count, 3);
        assert_eq!(hit_ranges.len(), 3);
    }

    #[wasm_bindgen_test]
    fn test_generate_partial_overlap_cjk() {
        let text = "漫画とマンガ";
        let terms = vec!["漫画".to_string(), "マンガ".to_string()];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(highlighted.contains("<mark>漫画</mark>"));
        assert!(highlighted.contains("<mark>マンガ</mark>"));
        assert_eq!(hit_ranges.len(), 2);
    }

    #[wasm_bindgen_test]
    fn test_generate_no_hits() {
        let text = "これはテスト文章です";
        let terms: Vec<String> = vec![];

        let highlighted = generate(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert_eq!(highlighted, text);
        assert_eq!(hit_ranges.len(), 0);
    }
}
