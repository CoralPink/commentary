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

// TODO:
// I wanted to manipulate it by passing objects from js,
// but I just couldn't get it to work....
//
// I'll bring it up next time.
/*
#[allow(dead_code)]
#[wasm_bindgen]
pub struct DocObject {
    body: String,
    breadcrumbs: String,
    id: String,
    text: String,
    title: String,
}

#[allow(dead_code)]
#[wasm_bindgen]
pub struct SearchResult {
    doc: DocObject,
    reference: String,
    score: u32,
}
*/
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

fn highlighting(body: &str, weighted: &[(String, u32, usize)], range: (usize, usize)) -> String {
    let mut highlight = Vec::new();
    let mut index = weighted[range.0].2;

    for word in weighted.iter().skip(range.0).take(range.1) {
        // missing text from index to the start of `word`
        if index < word.2 {
            highlight.push(&body[index..word.2]);
            index = word.2;
        }

        if word.1 != TERM_WEIGHT {
            highlight.push(&body[word.2..index + word.0.len()]);
        } else {
            highlight.push("<em>");
            highlight.push(&body[word.2..index + word.0.len()]);
            highlight.push("</em>");
        }

        index = word.2 + word.0.len();
    }

    highlight.join("")
}

fn search_result_excerpt(body: &str, terms: Vec<String>, count: usize) -> String {
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
        body.to_string()
    } else {
        highlighting(body, &weighted, calc_start_end(&weighted, count, found))
    }
}

#[wasm_bindgen]
pub fn format_result(
    path_to_root: String,
    link_uri: String,
    doc_body: String,
    doc_breadcrumbs: String,
    term: String,
    count: usize,
) -> String {
    let uri: Vec<&str> = link_uri.split('#').collect();
    let page = uri[0];
    let head = if uri.len() > 1 {
        format!("#{}", uri[1])
    } else {
        "".to_owned()
    };

    format!(
        r#"<a href="{path_to_root}{page}?highlight={}{head}">{doc_breadcrumbs}</a><span class="teaser" aria-label="Search Result Teaser">{}</span>"#,
        js_sys::encode_uri_component(&term.split(' ').collect::<Vec<&str>>().join("%20"))
            .as_string()
            .unwrap()
            .replace('\'', "%27"),
        search_result_excerpt(
            &doc_body,
            term.split(' ').map(|s| s.to_string()).collect(),
            count,
        )
    )
}
