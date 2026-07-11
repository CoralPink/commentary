use bumpalo::Bump;
use bumpalo::collections::Vec as BumpVec;
use mdbook_preprocessor::{book::Book, errors::Error};
use regex::regex;

const FT_REF: &str = "ft-reference";
const FT_DEF: &str = "ft-definition";

pub fn replacing(mut book: Book) -> Result<Book, Error> {
    let bump = Bump::new();
    let mut itoa = itoa::Buffer::new();

    book.for_each_mut(|item| {
        if let mdbook_preprocessor::book::BookItem::Chapter(chap) = item {
            let mut footnotes = BumpVec::new_in(&bump);

            chap.content = regex!(r"(?s)\{\{footnote:\s*(?P<content>.*?)\}\}")
                .replace_all(&chap.content, |caps: &regex::Captures| {
                    let content = caps.name("content").unwrap().as_str().to_owned();
                    footnotes.push(content);

                    let mut s = String::new();
                    let idx = itoa.format(footnotes.len());

                    s.push_str("<sup class=\"");
                    s.push_str(FT_REF);
                    s.push_str("\"><button id=\"to-ft-");
                    s.push_str(idx);
                    s.push_str("\" data-href=\"#ft-");
                    s.push_str(idx);
                    s.push_str("\">");
                    s.push_str(idx);
                    s.push_str("</button></sup>");

                    s
                })
                .to_string();

            if !footnotes.is_empty() {
                for (num, content) in footnotes.into_iter().enumerate() {
                    let idx = itoa.format(num + 1);

                    chap.content.push('\n');
                    chap.content.push_str("<aside class=\"");
                    chap.content.push_str(FT_DEF);
                    chap.content.push_str("\" role=\"doc-footnote\" id=\"ft-");
                    chap.content.push_str(idx);
                    chap.content.push_str("\">\n\n<sup><a href=\"#to-ft-");
                    chap.content.push_str(idx);
                    chap.content.push_str("\">");
                    chap.content.push_str(idx);
                    chap.content.push_str(":</a></sup>");
                    chap.content.push_str(&content);
                    chap.content.push_str("</aside>");
                }
            }
        }
    });

    Ok(book)
}

#[cfg(test)]
mod tests {
    use crate::replacing;
    use mdbook_preprocessor::book::{Book, BookItem, Chapter};
    use pretty_assertions::assert_eq;
    use std::{fs, fs::File, io::Write, path::Path};

    const CLR_RESET: &str = "\x1b[0m";
    const CLR_R: &str = "\x1b[31m";
    const CLR_C: &str = "\x1b[36m";

    const TEST_DIR: &str = "test/";
    const TEST_MD: &str = "test.md";

    const OK_RESULT: &str = "ok.md";
    const OUTPUT_RESULT: &str = "result.md";

    fn write_chapters_to_files(chap: &Chapter) -> Result<(), Box<dyn std::error::Error>> {
        let mut file = File::create(String::from(TEST_DIR) + OUTPUT_RESULT)?;
        file.write_all(chap.content.as_bytes())?;

        Ok(())
    }

    #[test]
    fn test_footnote() {
        let mut book = Book::new();

        book.push_item(BookItem::Chapter(Chapter::new(
            "Test Chapter",
            fs::read_to_string(String::from(TEST_DIR) + TEST_MD).unwrap(),
            Path::new(TEST_MD),
            vec![],
        )));

        println!("{CLR_C}[INFO]{CLR_RESET} Depending on the test case, [WARNING] may be displayed.");

        match replacing(book) {
            Ok(book) => {
                for item in book.iter() {
                    if let BookItem::Chapter(chap) = item {
                        write_chapters_to_files(chap).unwrap_or_else(|err| panic!("{CLR_R}ERROR{CLR_RESET}: {err}"));
                        assert_eq!(
                            chap.content,
                            fs::read_to_string(String::from(TEST_DIR) + OK_RESULT).unwrap()
                        );
                    }
                }
            }
            Err(err) => {
                panic!("ERROR: {err}");
            }
        }
    }
}
