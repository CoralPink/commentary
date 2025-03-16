const SCORE_MATCH: isize = 16;
const SCORE_GAP_START: isize = -3;
const SCORE_GAP_EXTENSION: isize = -1;

const BONUS_BOUNDARY: isize = SCORE_MATCH / 2;
const BONUS_CAMEL123: isize = BONUS_BOUNDARY + SCORE_GAP_EXTENSION;
const BONUS_CONSECUTIVE: isize = -(SCORE_GAP_START + SCORE_GAP_EXTENSION);
const BONUS_FIRST_CHAR_MULTIPLIER: isize = 2;

fn boundary_bonus(curr: char, prev: Option<char>) -> isize {
    if prev.is_some_and(|p| {
        p == '_' || p == '-' || p == '/' || p.is_whitespace() || (p.is_lowercase() && curr.is_uppercase())
    }) {
        BONUS_BOUNDARY
    } else {
        0
    }
}

fn camel_case_bonus(curr: char, prev: char) -> isize {
    if prev.is_lowercase() && curr.is_uppercase() {
        BONUS_CAMEL123
    } else {
        0
    }
}

pub fn calc_score(query: &str, text: &str) -> usize {
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

            calc += boundary_bonus(c, text_chars.get(i.wrapping_sub(1)).copied());

            if i > 0 {
                calc += camel_case_bonus(c, text_chars[i - 1]);
            }

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
