use crate::searcher::constants::*;
use crate::searcher::excerpt::generate;
use crate::searcher::hit_list::HitList;

use memchr::{memchr2, memchr3};

const BUFFER_HTML_MAGNIFICATION: usize = 1024;

fn parse_uri(link_uri: &str) -> (&str, &str) {
    link_uri.split_once('#').unwrap_or((link_uri, ""))
}

struct SearchHit<'a> {
    id: usize,
    root_path: &'a str,
    page: &'a str,
    head: &'a str,
    breadcrumbs: &'a str,
    excerpt: &'a str,
    score: usize,
    marking: &'a str,
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

    pub fn finish(&mut self) -> String {
        let mut result_buf = Vec::with_capacity(self.buf.capacity());
        std::mem::swap(&mut self.buf, &mut result_buf);
        String::from_utf8(result_buf).unwrap()
    }

    pub fn clear(&mut self) {
        self.buf.clear();
    }

    /// Escapes HTML special characters: & < > " '
    fn safe_text(&mut self, text: &str) {
        self.buf.reserve(text.len());

        let bytes = text.as_bytes();
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

    fn raw_html(&mut self, html: &str) {
        self.buf.extend_from_slice(html.as_bytes());
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

    fn li_search_result(&mut self, hit: &SearchHit) {
        self.open("li");
        self.attr("tabindex", "0");
        self.attr("role", "option");
        self.attr_num("id", hit.id);
        self.buf.extend_from_slice(b" aria-label=\"");
        self.safe_text(hit.page);
        self.buf.push(b' ');
        self.num(hit.score);
        self.buf.extend_from_slice(b"pt\">");

        // link
        self.open("a");
        self.buf.extend_from_slice(b" href=\"");
        self.safe_text(hit.root_path);
        self.safe_text(hit.page);
        self.buf.extend_from_slice(b"?mark=");
        self.safe_text(hit.marking);
        self.buf.push(b'#');
        self.safe_text(hit.head);
        self.buf.extend_from_slice(b"\">");
        self.safe_text(hit.breadcrumbs);
        self.end("a");

        // excerpt
        self.open("span");
        self.attr("aria-hidden", "true");
        self.close_open();
        self.raw_html(hit.excerpt);
        self.end("span");

        // score
        self.open("div");
        self.attr("class", "score");
        self.attr("role", "meter");
        self.buf.extend_from_slice(b" aria-label=\"score:");
        self.num(hit.score);
        self.buf.extend_from_slice(b"pt\">");

        for _ in 0..std::cmp::min(hit.score, SCORE_BAR_MAX) / SCORE_BAR_RATE {
            self.buf.extend_from_slice(SCORE_BAR_CHARACTER.as_bytes());
        }

        self.buf.extend_from_slice(b" (");
        self.num(hit.score);
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
        let marking = &urlencoding::encode(&normalized_terms.join(" ")).into_owned();
        let mut rendered = 0;

        results.into_iter().for_each(|el| {
            let id = *el.id();

            if let Some(url) = url_table.get(id) {
                let (page, head) = parse_uri(url);
                let doc = el.doc();

                self.li_search_result(&SearchHit {
                    id,
                    root_path,
                    page,
                    head,
                    breadcrumbs: doc.breadcrumbs(),
                    excerpt: &generate(doc.body(), normalized_terms),
                    score: *el.score(),
                    marking,
                });

                rendered += 1;
            }
        });

        rendered
    }
}
