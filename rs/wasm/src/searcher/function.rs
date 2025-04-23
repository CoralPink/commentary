const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;
const SCORE_MAX_BAR: usize = 256;

pub fn is_full_width_or_ascii(s: &str) -> bool {
    s.chars().all(|c| {
        let code = c as u32;
        code <= 127 || (0xFF01..=0xFF5E).contains(&code)
    })
}

pub fn parse_uri(link_uri: &str) -> (&str, &str) {
    link_uri.split_once('#').unwrap_or((link_uri, ""))
}

pub fn scoring_notation(score: usize) -> String {
    let s = SCORE_CHARACTER.repeat(std::cmp::min(score, SCORE_MAX_BAR) / SCORE_RATE);
    format!("{s} ({score}pt)")
}
