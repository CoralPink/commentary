use crate::searcher::constants::*;

use getset::Getters;
use unicode_segmentation::UnicodeSegmentation;

/// Default importance for normal words.
const IMPORTANCE_DEFAULT: u16 = 8;
/// Importance for the first word of a text.
const IMPORTANCE_FIRST_WORD: u16 = 32;
/// Importance for matched search terms.
const IMPORTANCE_MATCH: u16 = 160;

/// A tokenized word in the text, with its byte position and importance.
struct HighlightedToken<'a> {
    position: usize,
    text: &'a str,
    importance: u16,
}

/// Represents a byte range in the text that matched a search term.
#[derive(Getters)]
pub struct HitRange {
    #[get = "pub"]
    start: usize,
    #[get = "pub"]
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

fn extract_window(tokens: &[HighlightedToken]) -> (usize, usize) {
    let range = calc_range_position(tokens);
    let end_index = calc_end_index(&range, tokens);

    let start = tokens[range.start].position;
    let end = tokens[end_index - 1].position + tokens[end_index - 1].text.len();

    (start, end)
}

/// Find all hit ranges in `body` corresponding to normalized search terms.
///
/// Returns a vector of `HitRange` with start/end byte positions.
pub fn get_hitranges(body: &str, normalized_terms: &[String]) -> Vec<HitRange> {
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

    vec.sort_unstable_by_key(|r| (r.start, r.end));

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

pub fn compute_window_from_ranges(body: &str, hit_ranges: &[HitRange]) -> (usize, usize) {
    let mut tokens = Vec::with_capacity(EXCERPT_TOKENS_MAX);

    for (position, text) in body.unicode_word_indices() {
        let mut importance = if position == 0 {
            IMPORTANCE_FIRST_WORD
        } else {
            IMPORTANCE_DEFAULT
        };

        for range in hit_ranges {
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

    extract_window(&tokens)
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_window_basic() {
        let text = "A B C 桃太郎 D E F";
        let terms = vec!["桃太郎".to_string()];

        let ranges = get_hitranges(text, &terms);
        let (start, end) = compute_window_from_ranges(text, &ranges);

        assert!(text[start..end].contains("桃太郎"));
    }
}
