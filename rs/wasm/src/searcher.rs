extern crate rust_stemmers;

use rust_stemmers::{Algorithm, Stemmer};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn make_teaser(body: &str, terms: Vec<String>, count: usize) -> String {
    const WEIGHT: u32 = 40;

    let mut weighted: Vec<(String, u32, usize)> = Vec::new();

    let mut value = 0;
    let mut idx = 0;
    let mut found = false;

    for x in body.to_lowercase().split(". ") {
        let words: Vec<&str> = x.split(' ').collect();
        value = 8;

        for y in words {
            if y.is_empty() {
                for z in terms
                    .iter()
                    .map(|w| Stemmer::create(Algorithm::English).stem(w))
                {
                    if Stemmer::create(Algorithm::English).stem(y) == z {
                        value = WEIGHT;
                        found = true;
                    }
                }
                weighted.push((y.to_string(), value, idx));
                value = 2;
            }
            idx += y.len();
            idx += 1; // ' ' or '.' if the last word in the sentence
        }

        idx += 1; // because we split at a two-char boundary '. '
    }

    if weighted.is_empty() {
        return body.to_string();
    }

    let window_size = std::cmp::min(weighted.len(), count);
    let window_weight = {
        let mut ret = Vec::new();
        let mut sum = 0;

        for i in 0..window_size {
            sum += weighted[i].1;
        }

        ret.push(sum);

        for i in 0..weighted.len() - window_size {
            sum -= weighted[i].1;
            sum += weighted[i + window_size].1;

            ret.push(sum);
        }
        ret
    };

    let max_sum_window_index = {
        if !found {
            0
        } else {
            let mut max_sum = 0;
            let mut ret = 0;

            // backwards
            for i in (0..window_weight.len()).rev() {
                if window_weight[i] > max_sum {
                    max_sum = window_weight[i];
                    ret = i;
                }
            }
            ret
        }
    };

    let mut teaser = Vec::new();
    let mut index = weighted[max_sum_window_index].2;

    for i in max_sum_window_index..max_sum_window_index + window_size {
        let word = &weighted[i];

        // missing text from index to the start of `word`
        if index < word.2 {
            teaser.push(&body[index..word.2]);
            index = word.2;
        }

        if word.1 != WEIGHT {
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
