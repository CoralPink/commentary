use arrayvec::ArrayVec;

const TEASER_WORD_COUNT: usize = 40;

const IMPORTANCE_DEFAULT: usize = 2;
const IMPORTANCE_FIRST_WORD: usize = 8;
const IMPORTANCE_MATCH: usize = 40;

const MARK_TAG: &str = "<mark>";
const MARK_TAG_END: &str = "</mark>";

const ARRAY_VEC_SIZE: usize = 512;

struct HighlightedToken {
    pub text: String,
    pub position: usize,
    pub importance: usize,
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

fn calc_excerpt_range_position(tokens: &ArrayVec<HighlightedToken, ARRAY_VEC_SIZE>) -> (usize, usize) {
    let end = std::cmp::min(tokens.len(), TEASER_WORD_COUNT);

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

fn apply_markup(tokens: &ArrayVec<HighlightedToken, ARRAY_VEC_SIZE>, body: &str) -> String {
    if tokens.is_empty() {
        return body.to_string();
    }

    let (start, end) = calc_excerpt_range_position(tokens);

    let mut markup_body = String::new();
    let mut idx = tokens[start].position;

    for token in tokens.iter().skip(start).take(end) {
        if idx < token.position {
            markup_body.push_str(&body[idx..token.position]);
            idx = token.position;
        }

        let s = &body[token.position..idx + token.text.len()];

        if token.importance == IMPORTANCE_MATCH {
            markup_body.push_str(MARK_TAG);
            markup_body.push_str(s);
            markup_body.push_str(MARK_TAG_END);
        } else {
            markup_body.push_str(s);
        }

        idx = token.position + token.text.len();
    }

    markup_body
}

pub fn search_result_excerpt(body: &str, normalized_texts: &[String]) -> String {
    let mut tokens = ArrayVec::<HighlightedToken, ARRAY_VEC_SIZE>::new();
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

    if tokens.is_empty() {
        return body.to_string();
    }
    apply_markup(&tokens, body)
}
