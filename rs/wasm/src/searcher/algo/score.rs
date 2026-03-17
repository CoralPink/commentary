//! The scoring algorithm is inspired by [junegunn/fzf](https://github.com/junegunn/fzf/blob/master/src/algo/algo.go)
//!
//! ...Though it's not a perfect replica, to be honest.
//! Sincere thanks to junegunn!
//!

use crate::searcher::algo::char_class::*;

/// Base score for a matching character
const SCORE_MATCH: isize = 16;
/// Penalty for starting a gap between matches
const SCORE_GAP_START: isize = -3;
/// Penalty for each character in a gap
const SCORE_GAP_EXTENSION: isize = -2;

/// Maximum distance between matching characters before gap penalty stops increasing
const SCORE_GAP_MAX_DISTANCE: usize = 360;

/// Bonus for matches at word boundaries
const BONUS_BOUNDARY: isize = SCORE_MATCH / 2;
/// Bonus for matches after non-alphanumeric characters
const BONUS_NON_WORD: isize = SCORE_MATCH / 2;
/// Bonus for matches in camelCase or snake_case transitions
const BONUS_CAMEL123: isize = BONUS_BOUNDARY + SCORE_GAP_EXTENSION;
/// Bonus for consecutive matches
const BONUS_CONSECUTIVE: isize = -(SCORE_GAP_START + SCORE_GAP_EXTENSION);

/// Bonus for matches after whitespace
const BONUS_WHITESPACE: isize = BONUS_BOUNDARY + 2;
/// Bonus for matches after delimiters like '/' or ':'
const BONUS_DELIMITER: isize = BONUS_BOUNDARY + 1;

/// Bonus for ひらがな character
const BONUS_HIRAGANA: isize = 8;
/// Bonus for カタカナ character
const BONUS_KATAKANA: isize = 32;
/// Bonus for 漢字 character
const BONUS_KANJI: isize = 64;
/// Bonus for 한글 character
const BONUS_HANGUL: isize = 32;

/// Bonus matrix for transitions between different character classes
/// Higher values indicate more significant word boundaries
const BONUS_MATRIX: [[isize; 10]; 10] = [
    // Prev: Whitespace, Delimiter, Lowercase, Uppercase, Digit, ひらがな, カタカナ, 漢字, 한글, Other
    /*                              -- Curr: */
    [4, 4, 0, 1, 2, 3, 2, 0, 0, 0], // Whitespace
    [2, 2, 0, 1, 4, 2, 4, 0, 0, 0], // Delimiter
    [8, 4, 0, 0, 0, 1, 0, 0, 0, 0], // Lowercase
    [9, 5, 1, 0, 0, 1, 0, 0, 0, 0], // Uppercase
    [8, 4, 0, 0, 0, 1, 0, 0, 0, 0], // Digit
    [0, 0, 0, 1, 0, 0, 1, 4, 0, 0], // ひらがな
    [0, 0, 0, 1, 0, 1, 2, 2, 0, 0], // カタカナ
    [0, 0, 0, 1, 0, 1, 1, 2, 0, 0], // 漢字
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // 한글
    [5, 3, 0, 0, 0, 0, 0, 0, 0, 0], // Other
];

/// Bonus for word boundaries based on previous character class
fn bonus_boundary(curr: &CharClass, prev: &Option<CharClass>) -> isize {
    match prev {
        Some(prev) => match prev {
            CharClass::Whitespace => BONUS_WHITESPACE,
            CharClass::Delimiter => BONUS_DELIMITER,
            CharClass::Lowercase if matches!(curr, CharClass::Uppercase) => BONUS_CAMEL123,
            CharClass::Other => BONUS_NON_WORD,
            _ => 0,
        },
        None => 0,
    }
}

/// Bonus matrix for transitions between character classes
fn bonus_matrix(curr: &CharClass, prev: &Option<CharClass>) -> isize {
    let prev_idx = prev.as_ref().map_or(CharClass::Other.as_index(), |c| c.as_index());
    let curr_idx = curr.as_index();

    BONUS_MATRIX[prev_idx][curr_idx]
}

/// Bonus for CJK characters
fn bonus_cjk(curr: &CharClass, _prev: &Option<CharClass>) -> isize {
    match curr {
        CharClass::Hiragana => BONUS_HIRAGANA,
        CharClass::Katakana => BONUS_KATAKANA,
        CharClass::Kanji => BONUS_KANJI,
        CharClass::Hangul => BONUS_HANGUL,
        _ => 0,
    }
}

fn bonus_distance(idx: usize, last_match: Option<usize>) -> isize {
    match last_match {
        Some(last) if last + 1 == idx => BONUS_CONSECUTIVE,
        Some(last) => {
            let distance = (idx.saturating_sub(last).min(SCORE_GAP_MAX_DISTANCE) as f32)
                .sqrt()
                .round() as isize;
            SCORE_GAP_EXTENSION * distance
        }
        None => 0,
    }
}

fn bonus_query_match(q: &CharClass, t: &CharClass) -> isize {
    match (q, t) {
        (CharClass::Kanji, CharClass::Kanji) => 10,
        (CharClass::Katakana, CharClass::Katakana) => 8,
        (CharClass::Hiragana, CharClass::Hiragana) => 6,

        (CharClass::Hiragana, CharClass::Kanji) => 5,

        (CharClass::Katakana, CharClass::Hiragana) => 4,
        (CharClass::Hiragana, CharClass::Katakana) => 4,

        (CharClass::Lowercase, CharClass::Lowercase) => 6,
        (CharClass::Uppercase, CharClass::Uppercase) => 6,

        _ => 0,
    }
}

pub fn compute(query: &str, text: &str) -> usize {
    let mut score: isize = 0;

    let mut last_match: Option<usize> = None;
    let mut prev: Option<CharClass> = None;

    let mut query_iter = query.chars();
    let mut p = query_iter.next();

    for (idx, curr) in text.char_indices() {
        let cur = classify_char(curr);

        if let Some(qc) = p {
            if qc != curr {
                prev = Some(cur);
                continue;
            }

            score += SCORE_MATCH;
            score += bonus_query_match(&classify_char(qc), &cur);

            score += bonus_boundary(&cur, &prev);
            score += bonus_matrix(&cur, &prev);
            score += bonus_cjk(&cur, &prev);

            score += bonus_distance(idx, last_match);

            last_match = Some(idx);
            prev = Some(cur);

            p = query_iter.next();
        }

        if p.is_none() {
            break;
        }
    }

    score.max(0) as usize
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_classify_char_basic() {
        assert_eq!(classify_char(' '), CharClass::Whitespace);
        assert_eq!(classify_char('\n'), CharClass::Whitespace);
        assert_eq!(classify_char('/'), CharClass::Delimiter);
        assert_eq!(classify_char('a'), CharClass::Lowercase);
        assert_eq!(classify_char('Z'), CharClass::Uppercase);
        assert_eq!(classify_char('0'), CharClass::Digit);
        assert_eq!(classify_char('あ'), CharClass::Hiragana);
        assert_eq!(classify_char('ア'), CharClass::Katakana);
        assert_eq!(classify_char('漢'), CharClass::Kanji);
        assert_eq!(classify_char('가'), CharClass::Hangul);
        assert_eq!(classify_char('%'), CharClass::Other);
    }

    #[wasm_bindgen_test]
    fn test_bonus_boundary() {
        let ws = CharClass::Whitespace;
        let dl = CharClass::Delimiter;
        let lc = CharClass::Lowercase;
        let uc = CharClass::Uppercase;
        let other = CharClass::Other;

        assert_eq!(bonus_boundary(&uc, &Some(ws)), BONUS_WHITESPACE);
        assert_eq!(bonus_boundary(&uc, &Some(dl)), BONUS_DELIMITER);
        assert_eq!(bonus_boundary(&uc, &Some(other)), BONUS_NON_WORD);
        assert_eq!(bonus_boundary(&uc, &None), 0);

        // Camel case
        assert_eq!(bonus_boundary(&uc, &Some(lc)), BONUS_CAMEL123);
    }

    #[wasm_bindgen_test]
    fn test_bonus_matrix() {
        let prev = Some(CharClass::Whitespace);
        let curr = CharClass::Kanji;

        assert_eq!(
            bonus_matrix(&curr, &prev),
            BONUS_MATRIX[CharClass::Whitespace.as_index()][CharClass::Kanji.as_index()]
        );

        let prev_none: Option<CharClass> = None;
        assert_eq!(
            bonus_matrix(&curr, &prev_none),
            BONUS_MATRIX[CharClass::Other.as_index()][CharClass::Kanji.as_index()]
        );
    }

    #[wasm_bindgen_test]
    fn test_bonus_cjk() {
        assert_eq!(bonus_cjk(&CharClass::Hiragana, &None), BONUS_HIRAGANA);
        assert_eq!(bonus_cjk(&CharClass::Katakana, &None), BONUS_KATAKANA);
        assert_eq!(bonus_cjk(&CharClass::Kanji, &None), BONUS_KANJI);
        assert_eq!(bonus_cjk(&CharClass::Hangul, &None), BONUS_HANGUL);
        assert_eq!(bonus_cjk(&CharClass::Lowercase, &None), 0);
        assert_eq!(bonus_cjk(&CharClass::Uppercase, &None), 0);
        assert_eq!(bonus_cjk(&CharClass::Other, &None), 0);
    }

    #[wasm_bindgen_test]
    fn test_bonus_distance() {
        assert_eq!(bonus_distance(5, None), 0);
        assert_eq!(bonus_distance(6, Some(5)), BONUS_CONSECUTIVE);
    }

    #[wasm_bindgen_test]
    fn test_bonus_query_match() {
        assert_eq!(bonus_query_match(&CharClass::Kanji, &CharClass::Kanji), 10);
        assert_eq!(bonus_query_match(&CharClass::Hiragana, &CharClass::Kanji), 5);
        assert_eq!(bonus_query_match(&CharClass::Katakana, &CharClass::Hiragana), 4);
        assert_eq!(bonus_query_match(&CharClass::Lowercase, &CharClass::Lowercase), 6);
        assert_eq!(bonus_query_match(&CharClass::Uppercase, &CharClass::Uppercase), 6);
        assert_eq!(bonus_query_match(&CharClass::Other, &CharClass::Other), 0);
    }
}
