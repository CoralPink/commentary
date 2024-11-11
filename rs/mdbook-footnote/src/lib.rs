use mdbook::{book::Book, errors::Error};
use regex::Regex;
use std::sync::LazyLock;

const FT_REF: &str = "ft-reference";
const FT_DEF: &str = "ft-definition";

static FOOTNOTE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?s)\{\{footnote:\s*(?P<content>.*?)\}\}").expect("Invalid regex for FOOTNOTE_RE")
});

pub fn replacing(mut book: Book) -> Result<Book, Error> {
    book.for_each_mut(|item| {
        if let mdbook::book::BookItem::Chapter(chap) = item {
            let mut footnotes = vec![];

            chap.content = FOOTNOTE_RE
                .replace_all(&chap.content, |caps: &regex::Captures| {
                    let content = caps.name("content").unwrap().as_str().to_owned();
                    footnotes.push(content);

                    let idx = footnotes.len();
                    format!("<sup class=\"{FT_REF}\"><a name=\"to-ft-{idx}\" href=\"#ft-{idx}\">{idx}</a></sup>")
                })
                .to_string();

            if !footnotes.is_empty() {
                for (num, content) in footnotes.into_iter().enumerate() {
                    let idx = num + 1;

                    chap.content += &format!(
                        "\n<aside class=\"{FT_DEF}\" role=\"doc-footnote\" id=\"ft-{idx}\">\n\n<sup><a href=\"#to-ft-{idx}\">{idx}:</a></sup>{content}</aside>"
                    );
                }
            }
        }
    });

    Ok(book)
}

#[cfg(test)]
mod tests {
    use crate::replacing;
    use mdbook::book::{Book, BookItem, Chapter};
    use pretty_assertions::assert_eq;
    use std::{fs, fs::File, io::Write};

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
            std::path::Path::new(TEST_MD),
            vec![],
        )));

        println!(
            "{CLR_C}[INFO]{CLR_RESET} Depending on the test case, [WARNING] may be displayed."
        );

        match replacing(book) {
            Ok(book) => {
                for item in book.iter() {
                    if let BookItem::Chapter(chap) = item {
                        write_chapters_to_files(chap)
                            .unwrap_or_else(|err| panic!("{CLR_R}ERROR{CLR_RESET}: {err}"));
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
