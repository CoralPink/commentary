use crate::searcher::excerpt::generate;
use crate::searcher::hit_list::HitList;

const BUFFER_HTML_MAGNIFICATION: usize = 1024;

const SCORE_CHARACTER: &str = "▰";
const SCORE_RATE: usize = 8;
const SCORE_MAX_BAR: usize = 256;

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

    pub fn into_string(self) -> String {
        String::from_utf8(self.buf).unwrap()
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
        let s = self.itoa.format(value);
        self.buf.extend_from_slice(name.as_bytes());
        self.buf.extend_from_slice(b"=\"");
        self.buf.extend_from_slice(s.as_bytes());
        self.buf.push(b'"');
    }

    pub fn num(&mut self, value: usize) {
        let s = self.itoa.format(value);
        self.buf.extend_from_slice(s.as_bytes());
    }

    fn close_open(&mut self) {
        self.buf.push(b'>');
    }

    fn end(&mut self, tag: &str) {
        self.buf.extend_from_slice(b"</");
        self.buf.extend_from_slice(tag.as_bytes());
        self.buf.push(b'>');
    }

    fn safe_text(&mut self, text: &str) {
        for b in text.as_bytes() {
            match *b {
                b'&' => self.buf.extend_from_slice(b"&amp;"),
                b'<' => self.buf.extend_from_slice(b"&lt;"),
                b'>' => self.buf.extend_from_slice(b"&gt;"),
                b'"' => self.buf.extend_from_slice(b"&quot;"),
                b'\'' => self.buf.extend_from_slice(b"&#39;"),
                _ => self.buf.push(*b),
            }
        }
    }

    fn raw_html(&mut self, html: &str) {
        self.buf.extend_from_slice(html.as_bytes());
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
        self.buf.push(b'"');
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

        for _ in 0..std::cmp::min(hit.score, SCORE_MAX_BAR) / SCORE_RATE {
            self.buf.extend_from_slice(SCORE_CHARACTER.as_bytes());
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
