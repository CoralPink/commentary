//! The scoring algorithm is inspired by [junegunn/fzf](https://github.com/junegunn/fzf/blob/master/src/algo/algo.go)
//!
//! ...Though it's not a perfect replica, to be honest.
//! Sincere thanks to junegunn!
//!
pub mod score {
    // Base score for a matching character
    const SCORE_MATCH: isize = 16;
    // Penalty for starting a gap between matches
    const SCORE_GAP_START: isize = -3;
    // Penalty for each character in a gap
    const SCORE_GAP_EXTENSION: isize = -1;

    // Bonus for matches at word boundaries
    const BONUS_BOUNDARY: isize = SCORE_MATCH / 2;
    // Bonus for matches after non-alphanumeric characters
    const BONUS_NON_WORD: isize = SCORE_MATCH / 2;
    // Bonus for matches in camelCase or snake_case transitions
    const BONUS_CAMEL123: isize = BONUS_BOUNDARY + SCORE_GAP_EXTENSION;
    // Bonus for consecutive matches
    const BONUS_CONSECUTIVE: isize = -(SCORE_GAP_START + SCORE_GAP_EXTENSION);
    // Multiplier for the first matching character
    const BONUS_FIRST_CHAR_MULTIPLIER: isize = 2;

    // Bonus for matches after whitespace
    const BONUS_WHITESPACE: isize = BONUS_BOUNDARY + 2;
    // Bonus for matches after delimiters like '/' or ':'
    const BONUS_DELIMITER: isize = BONUS_BOUNDARY + 1;

    // Bonus matrix for transitions between different character classes
    // Higher values indicate more significant word boundaries
    const BONUS_MATRIX: [[isize; 6]; 6] = [
        // Prev: Whitespace, Delimiter, Lowercase, Uppercase, Digit, Other
        /* Curr: */
        [0, 0, 0, 0, 0, 0],  // Whitespace
        [0, 0, 0, 0, 0, 0],  // Delimiter
        [10, 5, 0, 0, 0, 0], // Lowercase (high bonus after space/delimiter)
        [12, 6, 6, 0, 0, 0], // Uppercase (highest bonus for camelCase and PascalCase)
        [8, 4, 0, 0, 0, 0],  // Digit (medium bonus after space/delimiter)
        [5, 3, 0, 0, 0, 0],  // Other (small bonus after space/delimiter)
    ];

    // Define a common set of delimiters used throughout the module
    const DELIMITERS: [char; 4] = ['/', ':', ';', ','];

    fn is_delimiter(c: char) -> bool {
        DELIMITERS.contains(&c)
    }

    #[derive(PartialEq, Eq)]
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
        let prev = prev.map_or(CharClass::Other, classify_char);
        let curr = classify_char(curr);

        BONUS_MATRIX[prev as usize][curr as usize]
    }

    fn boundary_bonus(curr: char, prev: Option<char>) -> isize {
        match prev {
            // after a blank space
            Some(p) if p.is_whitespace() => BONUS_WHITESPACE,
            //After the delimiter
            Some(p) if is_delimiter(p) => BONUS_DELIMITER,
            //Camel case boundaries
            Some(p) if p.is_lowercase() && curr.is_uppercase() => BONUS_CAMEL123,
            // after the symbol
            Some(p) if !p.is_alphanumeric() => BONUS_NON_WORD,
            // no match
            _ => 0,
        }
    }

    pub fn compute(query: &str, text: &str) -> usize {
        let mut score: isize = 0;

        let mut last_match = None;
        let mut query_chars = query.chars();
        let mut query_idx = 0;
        let mut query_char = query_chars.next();

        let text_chars: Vec<char> = text.chars().collect();

        for (i, c) in text_chars.iter().enumerate() {
            if let Some(qc) = query_char {
                if qc != *c {
                    continue;
                }

                let mut calc: isize = SCORE_MATCH;

                if let Some(last) = last_match {
                    if last + 1 == i {
                        calc += BONUS_CONSECUTIVE;
                    } else {
                        calc += SCORE_GAP_START + SCORE_GAP_EXTENSION * ((i - last) as isize);
                    }
                }

                let prev_char = text_chars.get(i.wrapping_sub(1));

                calc += boundary_bonus(*c, prev_char.cloned());
                calc += bonus_matrix(*c, prev_char.cloned());

                if query_idx == 0 {
                    calc *= BONUS_FIRST_CHAR_MULTIPLIER;
                }

                score += calc;

                last_match = Some(i);
                query_idx += 1;
                query_char = query_chars.next();
            }

            if query_char.is_none() {
                break;
            }
        }

        score.max(0) as usize
    }
}
