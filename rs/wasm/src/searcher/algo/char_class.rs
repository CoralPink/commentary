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
            CharClass::Whitespace => 0,
            CharClass::Delimiter => 1,
            CharClass::Lowercase => 2,
            CharClass::Uppercase => 3,
            CharClass::Digit => 4,
            CharClass::Hiragana => 5,
            CharClass::Katakana => 6,
            CharClass::Kanji => 7,
            CharClass::Hangul => 8,
            CharClass::Other => 9,
        }
    }
}

fn is_delimiter(c: char) -> bool {
    matches!(c, '/' | ':' | ';' | ',')
}

pub fn classify_char(c: char) -> CharClass {
    match c {
        _ if c.is_whitespace() => CharClass::Whitespace,
        _ if is_delimiter(c) => CharClass::Delimiter,
        _ if c.is_ascii_lowercase() => CharClass::Lowercase,
        _ if c.is_ascii_uppercase() => CharClass::Uppercase,
        '\u{3040}'..='\u{309F}' => CharClass::Hiragana,
        '\u{30A0}'..='\u{30FF}' => CharClass::Katakana,
        '\u{4E00}'..='\u{9FFF}' => CharClass::Kanji,
        '\u{3400}'..='\u{4DBF}' => CharClass::Kanji,
        '\u{AC00}'..='\u{D7AF}' => CharClass::Hangul,
        _ if c.is_ascii_digit() => CharClass::Digit,
        _ => CharClass::Other,
    }
}
