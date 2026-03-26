use crate::searcher::constants::*;
use crate::searcher::excerpt::generate;
use crate::searcher::hit_list::{Hit, HitList};

use memchr::{memchr2, memchr3};

const BUFFER_HTML_MAGNIFICATION: usize = 1024;

const WRITE_SCORE_BAR_CHARACTER: &[u8] = SCORE_BAR_CHARACTER.as_bytes();

fn parse_uri(link_uri: &str) -> (&str, &str) {
    link_uri.split_once('#').unwrap_or((link_uri, ""))
}

struct SearchHit<'a> {
    root_path: &'a str,
    page: &'a str,
    head: &'a str,
    excerpt: &'a str,
    marking: &'a str,
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

        let mut result_buf = Vec::with_capacity(8 + header.len() + html.len());

        // 4byte : header length
        result_buf.extend(&header.len().to_le_bytes());
        // 4byte : html length
        result_buf.extend(&html.len().to_le_bytes());

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
        self.buf.extend_from_slice(b" href=\"");
        self.safe_text(hit.root_path);
        self.safe_text(hit.page);
        self.buf.extend_from_slice(b"?mark=");
        self.buf.extend_from_slice(hit.marking.as_bytes());
        self.buf.push(b'#');
        self.safe_text(hit.head);
        self.buf.extend_from_slice(b"\">");
        self.safe_text(doc.breadcrumbs());
        self.end("a");

        // excerpt
        self.open("span");
        self.attr("aria-hidden", "true");
        self.close_open();
        self.buf.extend_from_slice(hit.excerpt.as_bytes());
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
        let marking = &urlencoding::encode(&normalized_terms.join(" ")).into_owned();
        let mut rendered = 0;

        results.into_iter().for_each(|el| {
            if let Some(url) = url_table.get(*el.id()) {
                let (page, head) = parse_uri(url);
                let excerpt = &generate(el.doc().body(), normalized_terms);

                self.li_search_result(&SearchHit {
                    root_path,
                    page,
                    head,
                    excerpt,
                    marking,
                    el,
                });

                rendered += 1;
            }
        });

        rendered
    }
}
