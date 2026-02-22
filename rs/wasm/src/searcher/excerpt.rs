use unicode_segmentation::UnicodeSegmentation;

const TEASER_WORD_COUNT: usize = 64;

const IMPORTANCE_DEFAULT: usize = 2;
const IMPORTANCE_FIRST_WORD: usize = 16;
const IMPORTANCE_MATCH: usize = 40;

struct ExcerptToken {
    text: String,
    position: usize,
    importance: usize,
}

fn compute_importance(text: &str, pos: usize, normalized_texts: &[String]) -> usize {
    let mut score = IMPORTANCE_DEFAULT;

    for term in normalized_texts {
        if text.to_lowercase().contains(term) {
            score += IMPORTANCE_MATCH;
        }
    }

    if pos == 0 {
        score += IMPORTANCE_FIRST_WORD;
    }

    score
}

fn calc_range_position(tokens: &[ExcerptToken]) -> (usize, usize) {
    let end = std::cmp::min(tokens.len(), TEASER_WORD_COUNT);

    if !tokens.iter().any(|x| x.importance >= IMPORTANCE_MATCH) {
        return (0, end);
    }

    let mut potential = tokens.iter().take(end).map(|x| x.importance).sum::<usize>();

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

fn calc_utf8(pos: usize, body: &str) -> usize {
    let p = pos.min(body.len());

    body.char_indices()
        .find(|&(i, _)| i >= p)
        .map(|(i, _)| i)
        .unwrap_or(body.len())
}

fn build_text(tokens: &[ExcerptToken], body: &str) -> String {
    if tokens.is_empty() {
        return body.to_string();
    }

    let (l, r) = calc_range_position(tokens);

    let start = tokens[l].position;

    let r2 = tokens[l + r - 1].position + tokens[l + r - 1].text.len();
    let end = if r2 < start { start } else { r2 };

    body[calc_utf8(start, body)..calc_utf8(end, body)].to_string()
}

pub fn generate(body: &str, normalized_texts: &[String]) -> String {
    let mut tokens = Vec::<ExcerptToken>::new();
    let mut pos: usize = 0;

    for sentence in body.unicode_sentences() {
        for word in sentence.split(' ').filter(|w| !w.is_empty()) {
            let imp = compute_importance(word, pos, normalized_texts);

            tokens.push(ExcerptToken {
                text: word.to_string(),
                position: pos,
                importance: imp,
            });

            pos += word.len() + 1;
        }
        pos += 1;
    }

    build_text(&tokens, body)
}
