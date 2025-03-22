//! The scoring algorithm is inspired by
//! [junegunn/fzf](https://github.com/junegunn/fzf/blob/923c3a814de39ff906d675834af634252b3d2b3f/src/algo/algo.go).
//!
//! ...Though it's not a perfect replica, to be honest.
//! Sincere thanks to junegunn!
//!
pub mod score {
    const SCORE_MATCH: isize = 16;
    const SCORE_GAP_START: isize = -3;
    const SCORE_GAP_EXTENSION: isize = -1;

    const BONUS_BOUNDARY: isize = SCORE_MATCH / 2;
    const BONUS_NON_WORD: isize = SCORE_MATCH / 2;
    const BONUS_CAMEL123: isize = BONUS_BOUNDARY + SCORE_GAP_EXTENSION;
    const BONUS_CONSECUTIVE: isize = -(SCORE_GAP_START + SCORE_GAP_EXTENSION);
    const BONUS_FIRST_CHAR_MULTIPLIER: isize = 2;

    const BONUS_WHITESPACE: isize = BONUS_BOUNDARY + 2;
    const BONUS_DELIMITER: isize = BONUS_BOUNDARY + 1;

    const BONUS_MATRIX: [[isize; 6]; 6] = [
        // Prev: Whitespace, Delimiter, Lowercase, Uppercase, Digit, Other
        /* Curr: */
        [0, 0, 0, 0, 0, 0],  // Whitespace
        [0, 0, 0, 0, 0, 0],  // Delimiter
        [10, 5, 0, 0, 0, 0], // Lowercase
        [12, 6, 6, 0, 0, 0], // Uppercase
        [8, 4, 0, 0, 0, 0],  // Digit
        [5, 3, 0, 0, 0, 0],  // Other
    ];

    // Define a common set of delimiters used throughout the module
    const DELIMITERS: [char; 4] = ['/', ':', ';', ','];

    fn is_delimiter(c: char) -> bool {
        DELIMITERS.contains(&c)
    }

    #[derive(Clone, PartialEq, Eq)]
    enum CharClass {
        Whitespace,
        Delimiter,
        Lowercase,
        Uppercase,
        Digit,
        Other,
    }

    fn classify_char(c: char) -> CharClass {
        if c.is_whitespace() {
            CharClass::Whitespace
        } else if matches!(c, '/' | ':' | ';' | ',') {
            CharClass::Delimiter
        } else if c.is_ascii_lowercase() {
            CharClass::Lowercase
        } else if c.is_ascii_uppercase() {
            CharClass::Uppercase
        } else if c.is_ascii_digit() {
            CharClass::Digit
        } else {
            CharClass::Other
        }
    }

    fn bonus_matrix(curr: char, prev: Option<char>) -> isize {
        let prev_class = prev.map_or(CharClass::Other, classify_char);
        let curr_class = classify_char(curr);

        let prev_idx = prev_class as usize;
        let curr_idx = curr_class as usize;

        BONUS_MATRIX[prev_idx][curr_idx]
    }

    fn boundary_bonus(curr: char, prev: Option<char>) -> isize {
        match prev {
            Some(p) if p.is_whitespace() => BONUS_WHITESPACE, // after a blank space
            Some(p) if is_delimiter(p) => BONUS_DELIMITER,    // After the delimiter
            Some(p) if p.is_lowercase() && curr.is_uppercase() => BONUS_CAMEL123, // Camel case boundaries
            Some(p) if !p.is_alphanumeric() => BONUS_NON_WORD, // after the symbol
            _ => 0,
        }
    }

    pub fn compute(query: &str, text: &str) -> usize {
        let mut score: isize = 0;
        let mut last_match = None;

        let query_chars: Vec<char> = query.chars().collect();
        let text_chars: Vec<char> = text.chars().collect();

        let mut query_idx = 0;

        for (i, &c) in text_chars.iter().enumerate() {
            if query_idx < query_chars.len() && query_chars[query_idx] == c {
                let mut calc: isize = SCORE_MATCH;

                if let Some(last) = last_match {
                    if last + 1 == i {
                        calc += BONUS_CONSECUTIVE;
                    } else {
                        calc += SCORE_GAP_START + SCORE_GAP_EXTENSION * ((i - last) as isize);
                    }
                }

                let prev_char = text_chars.get(i.wrapping_sub(1)).copied();
                calc += boundary_bonus(c, prev_char);
                calc += bonus_matrix(c, prev_char);

                if query_idx == 0 {
                    calc *= BONUS_FIRST_CHAR_MULTIPLIER;
                }

                score += calc;
                last_match = Some(i);
                query_idx += 1;
            }

            if query_idx == query_chars.len() {
                break;
            }
        }

        score.max(0) as usize
    }
}
