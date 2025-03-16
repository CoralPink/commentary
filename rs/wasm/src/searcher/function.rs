use arrayvec::ArrayVec;

use super::ARRAY_VEC_SIZE;
use crate::searcher::HighlightedToken;

const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;

const IMPORTANCE_DEFAULT: usize = 2;
const IMPORTANCE_FIRST_WORD: usize = 8;
const IMPORTANCE_MATCH: usize = 40;

const MARK_TAG: &str = "<mark>";
const MARK_TAG_END: &str = "</mark>";

pub fn is_full_width_or_ascii(s: &str) -> bool {
    if let Some(c) = s.chars().next() {
        let code = c as u32;
        code <= 127 || (0xFF01..=0xFF5E).contains(&code)
    } else {
        false
    }
}

pub fn parse_uri(link_uri: &str) -> (&str, &str) {
    link_uri.split_once('#').unwrap_or((link_uri, ""))
}

pub fn scoring_notation(score: usize) -> String {
    let s = SCORE_CHARACTER.repeat(score / SCORE_RATE);
    format!("{s} ({score}pt)")
}

fn compute_importance(text: &str, pos: usize, normalized_texts: &[String]) -> usize {
    if normalized_texts.iter().any(|x| text.contains(x)) {
        return IMPORTANCE_MATCH;
    }

    if pos == 0 {
        IMPORTANCE_FIRST_WORD
    } else {
        IMPORTANCE_DEFAULT
    }
}

fn calc_excerpt_range_position(tokens: &ArrayVec<HighlightedToken, ARRAY_VEC_SIZE>, count: usize) -> (usize, usize) {
    let end = std::cmp::min(tokens.len(), count);

    if !tokens.iter().any(|x| x.importance == IMPORTANCE_MATCH) {
        return (0, end);
    }

    let mut potential = tokens.iter().take(end).map(|x| x.importance).sum::<usize>();

    // Find the starting position with the greatest importance
    let (start, _) = std::iter::once(potential)
        .chain((0..tokens.len() - end).map(move |i| {
            potential -= tokens[i].importance;
            potential += tokens[i + end].importance;
            potential
        }))
        .enumerate()
        .max_by_key(|&(_, potential)| potential)
        .unwrap_or((0, 0));

    (start, end)
}

fn apply_markup(tokens: &ArrayVec<HighlightedToken, ARRAY_VEC_SIZE>, body: &str, count: usize) -> String {
    if tokens.is_empty() {
        return body.to_string();
    }

    let (start, end) = calc_excerpt_range_position(tokens, count);

    let mut highlight = String::new();
    let mut idx = tokens[start].position;

    for token in tokens.iter().skip(start).take(end) {
        if idx < token.position {
            highlight.push_str(&body[idx..token.position]);
            idx = token.position;
        }

        let s = &body[token.position..idx + token.text.len()];

        if token.importance == IMPORTANCE_MATCH {
            highlight.push_str(MARK_TAG);
            highlight.push_str(s);
            highlight.push_str(MARK_TAG_END);
        } else {
            highlight.push_str(s);
        }

        idx = token.position + token.text.len();
    }

    highlight
}

pub fn search_result_excerpt(
    tokens: &mut ArrayVec<HighlightedToken, ARRAY_VEC_SIZE>,
    body: &str,
    count: usize,
    normalized_texts: &[String],
) -> String {
    let mut pos: usize = 0;

    for sentence in body.to_lowercase().split(". ") {
        for text in sentence.split(' ').collect::<Vec<&str>>() {
            if text.is_empty() {
                pos += 1;
                continue;
            }

            tokens.push(HighlightedToken {
                text: text.to_string(),
                position: pos,
                importance: compute_importance(text, pos, normalized_texts),
            });

            pos += text.len() + 1;
        }
        pos += 1;
    }

    apply_markup(tokens, body, count)
}
