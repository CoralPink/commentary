use rust_stemmers::{Algorithm, Stemmer};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

const TERM_WEIGHT: u32 = 40;

fn window_weight(wgt: &Vec<(String, u32, usize)>, count: usize) -> Vec<u32> {
    let size = std::cmp::min(wgt.len(), count);
    let mut ret = Vec::new();
    let mut sum = 0;

    for x in wgt.iter().take(size) {
        sum += x.1;
    }

    ret.push(sum);

    for i in 0..wgt.len() - size {
        sum -= wgt[i].1;
        sum += wgt[i + size].1;

        ret.push(sum);
    }
    ret
}

fn calc_start_end(wgt: &Vec<(String, u32, usize)>, cnt: usize, fd: bool) -> (usize, usize) {
    let end = std::cmp::min(wgt.len(), cnt);

    if !fd {
        return (0, end);
    }

    let mut start = 0;
    let mut max_sum = 0;

    let window = window_weight(wgt, cnt);

    for i in (0..window.len()).rev() {
        if window[i] > max_sum {
            max_sum = window[i];
            start = i;
        }
    }
    (start, end)
}

#[wasm_bindgen]
pub fn make_teaser(body: &str, terms: Vec<String>, count: usize) -> String {
    let mut weighted: Vec<(String, u32, usize)> = Vec::new();

    let mut idx = 0;
    let mut found = false;

    for whole in body.to_lowercase().split(". ") {
        let words: Vec<&str> = whole.split(' ').collect();
        let mut value = 8;

        for separate in words {
            if !separate.is_empty() {
                let stemmed = Stemmer::create(Algorithm::English).stem(separate);

                for term in terms
                    .iter()
                    .map(|w| Stemmer::create(Algorithm::English).stem(w))
                {
                    if stemmed.starts_with(&term.to_lowercase()) {
                        value = TERM_WEIGHT;
                        found = true;
                    }
                }
                weighted.push((separate.to_string(), value, idx));
                value = 2;
            }
            idx += separate.len();
            idx += 1; // ' ' or '.' if the last word in the sentence
        }

        idx += 1; // because we split at a two-char boundary '. '
    }

    if weighted.is_empty() {
        return body.to_string();
    }

    let (start, end) = calc_start_end(&weighted, count, found);

    let mut teaser = Vec::new();
    let mut index = weighted[start].2;

    for word in weighted.iter().skip(start).take(end) {
        // missing text from index to the start of `word`
        if index < word.2 {
            teaser.push(&body[index..word.2]);
            index = word.2;
        }

        if word.1 != TERM_WEIGHT {
            teaser.push(&body[word.2..index + word.0.len()]);
        } else {
            teaser.push("<em>");
            teaser.push(&body[word.2..index + word.0.len()]);
            teaser.push("</em>");
        }

        index = word.2 + word.0.len();
    }

    teaser.join("")
}
