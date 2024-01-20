use mdbook::{book::Book, errors::Error};
use once_cell::sync::Lazy;
use regex::Regex;

static FOOTNOTE_RE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"(?s)\{\{footnote:\s*(?P<content>.*?)\}\}").expect("Invalid regex for FOOTNOTE_RE"));

pub fn replacing(mut book: Book) -> Result<Book, Error> {
    book.for_each_mut(|item| {
        if let mdbook::book::BookItem::Chapter(chap) = item {
            let mut footnotes = vec![];

            chap.content = FOOTNOTE_RE
                .replace_all(&chap.content, |caps: &regex::Captures| {
                    let content = caps.name("content").unwrap().as_str().to_owned();
                    footnotes.push(content);

                    let idx = footnotes.len();

                    format!(
                        "<sup class=\"footnote-reference\">
                          <a name=\"to-footnote-{idx}\">[{idx}](#{idx})</a>
                        </sup>"
                    )
                })
                .to_string();

            if !footnotes.is_empty() {
                for (idx, content) in footnotes.into_iter().enumerate() {
                    let num = idx + 1;

                    chap.content += &format!("<div class=\"footnote-definition\" id={num}>\n");
                    chap.content += &format!("\n\n[<sup>{num}:</sup>](#to-footnote-{num})");
                    chap.content += &format!(" {content}");
                    chap.content += "</div>";
                }
            }
        }
    });

    Ok(book)
}
