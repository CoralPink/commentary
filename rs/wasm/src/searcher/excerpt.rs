use crate::searcher::constants::*;

use bumpalo::Bump;
use bumpalo::collections::Vec as BumpVec;
use core::ops::Range;
use unicode_segmentation::UnicodeSegmentation;

/// Default importance for normal words.
const IMPORTANCE_DEFAULT: u16 = 8;
/// Importance for the first word of a text.
const IMPORTANCE_FIRST_WORD: u16 = 32;
/// Importance for matched search terms.
const IMPORTANCE_MATCH: u16 = 160;

/// rough guide to the number of ranges
const RANGES_ROUGH_GUIDE: usize = 8;

/// A tokenized word in the text, with its byte position and importance.
struct HighlightedToken<'a> {
    position: usize,
    text: &'a str,
    importance: u16,
}

/// Finds the best scoring window of tokens using a sliding window approach.
///
/// This function scans over the token sequence and selects a contiguous window
/// of fixed size (`TEASER_WORD_COUNT`) that maximizes the sum of importance scores.
///
/// It uses a sliding window optimization:
/// - Computes the initial window score
/// - Updates incrementally by subtracting the outgoing token and adding the incoming token
/// - Tracks the maximum scoring position
///
/// # Returns
/// A tuple `(start_index, window_size)` where:
/// - `start_index` is the beginning of the optimal window
/// - `window_size` is the effective window size (clamped by input length)
///
/// # Complexity
/// O(n), where n is the number of tokens
///
/// # Notes
/// This is the core heuristic used to decide which part of the document
/// should be shown in the search preview excerpt.
fn calc_range_position(tokens: &[HighlightedToken]) -> (usize, usize) {
    let size = TEASER_WORD_COUNT.min(tokens.len());
    let mut idx = 0;

    let mut potential: u16 = tokens.iter().take(size).map(|t| t.importance).sum();
    let mut p = potential;

    for i in 1..=tokens.len() - size {
        p = p - tokens[i - 1].importance + tokens[i + size - 1].importance;

        if p > potential {
            potential = p;
            idx = i;
        }
    }

    (idx, size)
}

/// Extends the selected token window to include consecutive matched tokens.
///
/// After selecting the optimal window, this function expands the range
/// forward if there are adjacent tokens marked as matches (`IMPORTANCE_MATCH`).
///
/// This ensures that search result highlights do not cut off multi-token
/// matches in the middle.
///
/// # Behavior
/// - Starts from `start + size`
/// - Extends forward while tokens are marked as `IMPORTANCE_MATCH`
/// - Stops at first non-matching token or end of list
///
/// # Returns
/// The exclusive end index of the expanded window
///
/// # Note
/// This step improves visual continuity in search result excerpts.
fn calc_end_index(start: usize, size: usize, tokens: &[HighlightedToken]) -> usize {
    let mut end_index = start + size;

    // If matches are consecutive, extend them to the end
    while end_index < tokens.len() && tokens[end_index].importance == IMPORTANCE_MATCH {
        end_index += 1;
    }

    end_index
}

/// Extracts the most relevant window of tokens based on importance scoring.
///
/// This function selects a contiguous window of tokens from the input slice
/// that maximizes the total importance score. Tokens that overlap with any
/// of the provided `hit_ranges` are given higher importance, which biases
/// the selection toward regions containing search matches.
///
/// If the input is empty, an empty range (`0..0`) is returned.
///
/// # Behavior
/// - Tokens overlapping with `hit_ranges` are assigned higher importance
/// - A sliding window of fixed size (`TEASER_WORD_COUNT`) is evaluated
/// - The window with the highest cumulative importance is selected
/// - Consecutive matched tokens may extend the final range beyond the window
///
/// # Returns
/// A byte range (`start..end`) representing the best excerpt window
/// within the original text.
///
/// # Note
/// This operates on pre-tokenized input and uses byte positions derived
/// from Unicode word segmentation.
fn extract_window(tokens: &[HighlightedToken]) -> Range<usize> {
    if tokens.is_empty() {
        return 0..0;
    }

    let (p_start, size) = calc_range_position(tokens);
    let p_end = calc_end_index(p_start, size, tokens) - 1;

    tokens[p_start].position..tokens[p_end].position + tokens[p_end].text.len()
}

/// Computes an optimal excerpt window from the document body based on search hit ranges.
///
/// The function tokenizes the input `body` into Unicode word segments and assigns
/// each token an importance score. Tokens overlapping with `hit_ranges` are marked
/// as highly important, which influences the selection of the final excerpt window.
///
/// The resulting window is chosen to maximize relevance while preserving local context
/// around matched terms.
///
/// # Arguments
/// - `body` - The full document text to analyze
/// - `hit_ranges` - Byte ranges representing matched search terms
///
/// # Returns
/// A byte range (`start..end`) representing the most relevant excerpt window
/// in the original text.
///
/// # Performance
/// Uses a bump allocator (`bumpalo`) for temporary token storage to reduce allocations.
///
/// # Note
/// This function bridges raw search matches and UI-level excerpt selection.
pub fn compute_window_from_ranges(body: &str, hit_ranges: &[Range<usize>]) -> Range<usize> {
    let bump = Bump::new();
    let mut tokens = BumpVec::with_capacity_in(EXCERPT_TOKENS_MAX, &bump);

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

/// Computes and merges byte ranges for all search term matches in the document body.
///
/// This function performs substring search for each normalized term and converts
/// matches into byte ranges. It then merges overlapping or adjacent ranges
/// into a single continuous set of ranges.
///
/// # Algorithm
/// 1. Iterate over each search term
/// 2. Find all occurrences in the document body
/// 3. Convert each match into a byte range
/// 4. Sort ranges by start position
/// 5. Merge overlapping or contiguous ranges
///
/// # Returns
/// A vector of merged, non-overlapping byte ranges representing all matches.
///
/// # Complexity
/// - Worst case: O(n * m) for search (n = text length, m = number of terms)
/// - Merge step: O(k log k), where k is number of matches
///
/// # Notes
/// This function is used as the foundation for highlight detection
/// before token-level scoring and window extraction.
pub fn get_hitranges(body: &str, normalized_terms: &[String]) -> Vec<Range<usize>> {
    let bump = Bump::new();
    let mut vec = BumpVec::with_capacity_in(normalized_terms.len() * RANGES_ROUGH_GUIDE, &bump);

    for term in normalized_terms {
        if term.is_empty() {
            continue;
        }

        let mut offset = 0;

        while let Some(pos) = body[offset..].find(term) {
            let start = offset + pos;
            let end = start + term.len();

            vec.push(start..end);
            offset = end;
        }
    }

    vec.sort_unstable_by_key(|r| (r.start, r.end));

    let mut merged: Vec<Range<usize>> = Vec::with_capacity(vec.len());

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
        let window = compute_window_from_ranges(text, &ranges);

        assert!(text[window.clone()].contains("桃太郎"));
    }
}
