fn is_delimiter(c: char) -> bool {
    matches!(c, '/' | ':' | ';' | ',')
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum CharClass {
    Whitespace,
    Delimiter,
    Lowercase,
    Uppercase,
    Digit,
    Hiragana,
    Katakana,
    Kanji,
    Hangul,
    Other,
}

impl CharClass {
    pub fn as_index(&self) -> usize {
        match self {
            Self::Whitespace => 0,
            Self::Delimiter => 1,
            Self::Lowercase => 2,
            Self::Uppercase => 3,
            Self::Digit => 4,
            Self::Hiragana => 5,
            Self::Katakana => 6,
            Self::Kanji => 7,
            Self::Hangul => 8,
            Self::Other => 9,
        }
    }

    pub fn classify_char(c: char) -> Self {
        match c {
            _ if c.is_whitespace() => Self::Whitespace,
            _ if is_delimiter(c) => Self::Delimiter,
            _ if c.is_ascii_lowercase() => Self::Lowercase,
            _ if c.is_ascii_uppercase() => Self::Uppercase,
            _ if c.is_ascii_digit() => Self::Digit,
            '\u{3040}'..='\u{309F}' => Self::Hiragana,
            '\u{30A0}'..='\u{30FF}' => Self::Katakana,
            '\u{4E00}'..='\u{9FFF}' => Self::Kanji,
            '\u{3400}'..='\u{4DBF}' => Self::Kanji,
            '\u{AC00}'..='\u{D7AF}' => Self::Hangul,
            _ => Self::Other,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_classify_char_basic() {
        assert_eq!(CharClass::classify_char(' '), CharClass::Whitespace);
        assert_eq!(CharClass::classify_char('\n'), CharClass::Whitespace);
        assert_eq!(CharClass::classify_char('/'), CharClass::Delimiter);
        assert_eq!(CharClass::classify_char('a'), CharClass::Lowercase);
        assert_eq!(CharClass::classify_char('Z'), CharClass::Uppercase);
        assert_eq!(CharClass::classify_char('0'), CharClass::Digit);
        assert_eq!(CharClass::classify_char('あ'), CharClass::Hiragana);
        assert_eq!(CharClass::classify_char('ア'), CharClass::Katakana);
        assert_eq!(CharClass::classify_char('漢'), CharClass::Kanji);
        assert_eq!(CharClass::classify_char('가'), CharClass::Hangul);
        assert_eq!(CharClass::classify_char('%'), CharClass::Other);
    }
}
