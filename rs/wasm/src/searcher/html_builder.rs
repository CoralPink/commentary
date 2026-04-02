use crate::searcher::constants::*;
use crate::searcher::excerpt::{compute_window_from_ranges, get_hitranges};
use crate::searcher::hit_list::{Hit, HitList};

use memchr::{memchr2, memchr3};
use percent_encoding::{AsciiSet, NON_ALPHANUMERIC, utf8_percent_encode};

/// Type used in the result field
type ResultFieldType = u32;
/// Size of `ResultFieldType`
const LENGTH_FIELD_SIZE: usize = std::mem::size_of::<ResultFieldType>();
/// Start position of the result data
const RESULT_DATA_OFFSET: usize = LENGTH_FIELD_SIZE * 2;

/// Buffer size multiplier for 1 search result
const BUFFER_HTML_MAGNIFICATION: usize = 1024;

/// Convert the text for the score bar defined in `constants.rs` to the u8 type and store it
const WRITE_SCORE_BAR_CHARACTER: &[u8] = SCORE_BAR_CHARACTER.as_bytes();

/// HTML tag used to mark highlighted words.
const MARK_TAG: &[u8] = "<mark>".as_bytes();
/// HTML closing tag for highlighted words.
const MARK_TAG_END: &[u8] = "</mark>".as_bytes();

/// Percent-encoding set for URL query strings (RFC 3986-based).
/// Uses relaxed "unreserved" rules for interoperability:
/// `- . _ ~` are left unencoded.
/// Not compatible with `application/x-www-form-urlencoded`.
///
/// See also:
/// https://datatracker.ietf.org/doc/html/rfc3986
const QUERY_SET: &AsciiSet = &NON_ALPHANUMERIC.remove(b'-').remove(b'.').remove(b'_').remove(b'~');

fn likely_safe(bytes: &[u8]) -> bool {
    memchr3(b'&', b'<', b'>', bytes).is_none() && memchr2(b'"', b'\'', bytes).is_none()
}

fn parse_uri(link_uri: &str) -> (&str, &str) {
    link_uri.split_once('#').unwrap_or((link_uri, ""))
}

fn write_encoded(buf: &mut Vec<u8>, input: &str) {
    for encoded in utf8_percent_encode(input, QUERY_SET) {
        buf.extend_from_slice(encoded.as_bytes());
    }
}

struct SearchHit<'a> {
    root_path: &'a str,
    page: &'a str,
    head: &'a str,
    normalized_terms: &'a [String],
    el: Hit<'a>,
}

pub struct HtmlBuilder {
    buf: Vec<u8>,
    itoa: itoa::Buffer,
}

impl HtmlBuilder {
    pub fn new_for_results(count: usize) -> Self {
        Self {
            buf: Vec::with_capacity(count * BUFFER_HTML_MAGNIFICATION),
            itoa: itoa::Buffer::new(),
        }
    }

    pub fn finish(&mut self, msg: &str) -> Box<[u8]> {
        let header = msg.as_bytes();
        let html = &self.buf;

        let mut result_buf = Vec::with_capacity(RESULT_DATA_OFFSET + header.len() + html.len());

        // 4byte : header length
        result_buf.extend(&(header.len() as ResultFieldType).to_le_bytes());
        // 4byte : html length
        result_buf.extend(&(html.len() as ResultFieldType).to_le_bytes());

        // data
        result_buf.extend(header);
        result_buf.extend(html);

        result_buf.into_boxed_slice()
    }

    pub fn clear(&mut self) {
        self.buf.clear();
    }

    /// Escapes HTML special characters: & < > " '
    fn safe_text(&mut self, text: &str) {
        let bytes = text.as_bytes();

        if likely_safe(bytes) {
            self.buf.extend_from_slice(bytes);
            return;
        }

        self.buf.reserve(text.len());

        let mut p = 0;

        while p < bytes.len() {
            // Find the earliest occurrence of any special character
            let pos1 = memchr3(b'&', b'<', b'>', &bytes[p..]);
            let pos2 = memchr2(b'"', b'\'', &bytes[p..]);

            let next = match (pos1, pos2) {
                (Some(a), Some(b)) => Some(p + a.min(b)),
                (Some(a), None) => Some(p + a),
                (None, Some(b)) => Some(p + b),
                (None, None) => None,
            };

            match next {
                Some(i) => {
                    if p < i {
                        self.buf.extend_from_slice(&bytes[p..i]);
                    }

                    match bytes[i] {
                        b'&' => self.buf.extend_from_slice(b"&amp;"),
                        b'<' => self.buf.extend_from_slice(b"&lt;"),
                        b'>' => self.buf.extend_from_slice(b"&gt;"),
                        b'"' => self.buf.extend_from_slice(b"&quot;"),
                        b'\'' => self.buf.extend_from_slice(b"&#39;"),
                        _ => unreachable!(),
                    }

                    p = i + 1;
                }
                None => {
                    if p < bytes.len() {
                        self.buf.extend_from_slice(&bytes[p..]);
                    }
                    break;
                }
            }
        }
    }

    pub fn write_highlighted_excerpt(&mut self, body: &str, normalized_terms: &[String]) {
        let hit_ranges = get_hitranges(body, normalized_terms);

        let window = compute_window_from_ranges(body, &hit_ranges);
        let (ws, we) = (window.start(), window.end());

        let mut pos = ws;

        for range in &hit_ranges {
            if range.end() <= ws || range.start() >= we {
                continue;
            }

            let start = range.start().max(ws);
            let end = range.end().min(we);

            if pos < start {
                self.safe_text(&body[*pos..*start]);
            }

            self.buf.extend_from_slice(MARK_TAG);

            let slice = &body[*start..*end];

            if likely_safe(slice.as_bytes()) {
                self.buf.extend_from_slice(slice.as_bytes());
            } else {
                self.safe_text(slice);
            }

            self.buf.extend_from_slice(MARK_TAG_END);

            pos = end;
        }

        if pos < we {
            self.safe_text(&body[*pos..*we]);
        }
    }

    fn open(&mut self, tag: &str) {
        self.buf.extend_from_slice(b"<");
        self.buf.extend_from_slice(tag.as_bytes());
    }

    fn attr(&mut self, key: &str, value: &str) {
        self.buf.push(b' ');
        self.buf.extend_from_slice(key.as_bytes());
        self.buf.extend_from_slice(b"=\"");
        self.safe_text(value);
        self.buf.push(b'"');
    }

    fn attr_num(&mut self, name: &str, value: usize) {
        self.buf.push(b' ');
        self.buf.extend_from_slice(name.as_bytes());
        self.buf.extend_from_slice(b"=\"");
        self.buf.extend_from_slice(self.itoa.format(value).as_bytes());
        self.buf.push(b'"');
    }

    pub fn num(&mut self, value: usize) {
        self.buf.extend_from_slice(self.itoa.format(value).as_bytes());
    }

    fn close_open(&mut self) {
        self.buf.push(b'>');
    }

    fn end(&mut self, tag: &str) {
        self.buf.extend_from_slice(b"</");
        self.buf.extend_from_slice(tag.as_bytes());
        self.buf.push(b'>');
    }

    fn write_mark(&mut self, normalized_terms: &[String]) {
        self.buf.extend_from_slice(b"?mark=");

        let mut first = true;

        for term in normalized_terms {
            if !first {
                self.buf.extend_from_slice(b"%20");
            }
            first = false;

            write_encoded(&mut self.buf, term);
        }
    }

    fn score_bar(&mut self, score: usize) {
        for _ in 0..std::cmp::min(score, SCORE_BAR_MAX) / SCORE_BAR_RATE {
            self.buf.extend_from_slice(WRITE_SCORE_BAR_CHARACTER);
        }
    }

    fn li_search_result(&mut self, hit: &SearchHit) {
        let doc = hit.el.doc();
        let score = hit.el.score();

        self.open("li");
        self.attr("tabindex", "0");
        self.attr("role", "option");
        self.attr_num("id", *hit.el.id());
        self.buf.extend_from_slice(b" aria-label=\"");
        self.safe_text(hit.page);
        self.buf.push(b' ');
        self.num(*score);
        self.buf.extend_from_slice(b"pt\">");

        // link
        self.open("a");
        self.attr("tabindex", "-1");
        self.buf.extend_from_slice(b" href=\"");
        self.safe_text(hit.root_path);
        self.safe_text(hit.page);
        self.write_mark(hit.normalized_terms);
        self.buf.push(b'#');
        self.safe_text(hit.head);
        self.buf.extend_from_slice(b"\">");
        self.safe_text(doc.breadcrumbs());
        self.end("a");

        // excerpt
        self.open("span");
        self.attr("aria-hidden", "true");
        self.close_open();
        self.write_highlighted_excerpt(doc.body(), hit.normalized_terms);
        self.end("span");

        // score
        self.open("div");
        self.attr("class", "score");
        self.attr("role", "meter");
        self.buf.extend_from_slice(b" aria-label=\"score:");
        self.num(*score);
        self.buf.extend_from_slice(b"pt\">");
        self.score_bar(*score);
        self.buf.extend_from_slice(b" (");
        self.num(*score);
        self.buf.extend_from_slice(b"pt)");
        self.end("div");

        self.end("li");
    }

    pub fn build_search_result(
        &mut self,
        root_path: &str,
        url_table: &[String],
        results: HitList,
        normalized_terms: &[String],
    ) -> usize {
        let mut rendered = 0;

        results.into_iter().for_each(|el| {
            if let Some(url) = url_table.get(*el.id()) {
                let (page, head) = parse_uri(url);

                self.li_search_result(&SearchHit {
                    root_path,
                    page,
                    head,
                    normalized_terms,
                    el,
                });

                rendered += 1;
            }
        });

        rendered
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::searcher::doc::DocObject;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    fn render(body: &str, terms: &[String]) -> String {
        let doc = DocObject::dummy("999", "dammy", body, "dam » my");
        let mut builder = HtmlBuilder::new_for_results(terms.len());
        builder.write_highlighted_excerpt(doc.body(), terms);

        String::from_utf8_lossy(&builder.buf).to_string()
    }

    #[wasm_bindgen_test]
    fn test_basic_cjk() {
        let text = "桃太郎が鬼ヶ島へ行った";
        let terms = vec!["桃太郎".to_string()];

        let html = render(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(html.contains("<mark>桃太郎</mark>"));
        assert_eq!(hit_ranges.len(), 1);
    }

    #[wasm_bindgen_test]
    fn test_multiple_cjk() {
        let text = "桃太郎と浦島太郎と金太郎が出てきた";
        let terms = vec!["桃太郎".to_string(), "浦島太郎".to_string(), "金太郎".to_string()];

        let html = render(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(html.contains("<mark>桃太郎</mark>"));
        assert!(html.contains("<mark>浦島太郎</mark>"));
        assert!(html.contains("<mark>金太郎</mark>"));
        assert_eq!(hit_ranges.len(), 3);
    }

    #[wasm_bindgen_test]
    fn test_cjk_at_end() {
        let text = "鬼ヶ島へ行ったのは桃太郎";
        let terms = vec!["桃太郎".to_string()];

        let html = render(text, &terms);

        assert!(html.contains("<mark>桃太郎</mark>"));
    }

    #[wasm_bindgen_test]
    fn test_overlapping_terms() {
        let text = "桃太郎と桃太郎太郎";
        let terms = vec!["桃太郎".to_string(), "太郎".to_string()];

        let html = render(text, &terms);

        assert!(html.contains("<mark>桃太郎</mark>"));
        assert!(html.matches("<mark>").count() >= 2);
    }

    #[wasm_bindgen_test]
    fn test_mixed_cjk_ascii() {
        let text = "桃太郎 is a famous character in Japan";
        let terms = vec!["桃太郎".to_string(), "Japan".to_string()];

        let html = render(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(html.contains("<mark>桃太郎</mark>"));
        assert!(html.contains("<mark>Japan</mark>"));
        assert_eq!(hit_ranges.len(), 2);
    }

    #[wasm_bindgen_test]
    fn test_multiple_occurrences() {
        let text = "桃太郎と桃太郎と桃太郎";
        let terms = vec!["桃太郎".to_string()];

        let html = render(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert_eq!(html.matches("<mark>").count(), 3);
        assert_eq!(hit_ranges.len(), 3);
    }

    #[wasm_bindgen_test]
    fn test_partial_overlap_cjk() {
        let text = "漫画とマンガ";
        let terms = vec!["漫画".to_string(), "マンガ".to_string()];

        let html = render(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert!(html.contains("<mark>漫画</mark>"));
        assert!(html.contains("<mark>マンガ</mark>"));
        assert_eq!(hit_ranges.len(), 2);
    }

    #[wasm_bindgen_test]
    fn test_no_hits() {
        let text = "これはテスト文章です";
        let terms: Vec<String> = vec![];

        let html = render(text, &terms);
        let hit_ranges = get_hitranges(text, &terms);

        assert_eq!(html, text);
        assert_eq!(hit_ranges.len(), 0);
    }
}
