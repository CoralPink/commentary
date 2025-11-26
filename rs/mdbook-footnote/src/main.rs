use crate::footnote_lib::Footnote;

use clap::{Arg, ArgMatches, Command};
use mdbook_preprocessor::{
    book::Book,
    errors::Result,
    {Preprocessor, PreprocessorContext},
};
use semver::{Version, VersionReq};
use std::{io, process};

pub fn make_app() -> Command {
    Command::new("footnote-preprocessor")
        .about("An mdbook preprocessor which converts expands footnote markers")
        .subcommand(
            Command::new("supports")
                .arg(Arg::new("renderer").required(true))
                .about("Check whether a renderer is supported by this preprocessor"),
        )
}

fn main() {
    let matches = make_app().get_matches();
    let preprocessor = Footnote::new();

    if let Some(sub_args) = matches.subcommand_matches("supports") {
        handle_supports(&preprocessor, sub_args);
    } else if let Err(e) = handle_preprocessing(&preprocessor) {
        eprintln!("{e}");
        process::exit(1);
    }
}

fn handle_preprocessing(pre: &dyn Preprocessor) -> Result<()> {
    let (ctx, book) = mdbook_preprocessor::parse_input(io::stdin())?;

    let book_version = Version::parse(&ctx.mdbook_version)?;
    let version_req = VersionReq::parse(mdbook_preprocessor::MDBOOK_VERSION)?;

    if !version_req.matches(&book_version) {
        eprintln!(
            "Warning: The {} plugin was built against version {} of mdbook, but we're being called from version {}",
            pre.name(),
            mdbook_preprocessor::MDBOOK_VERSION,
            ctx.mdbook_version
        );
    }

    let processed_book = pre.run(&ctx, book)?;
    serde_json::to_writer(io::stdout(), &processed_book)?;

    Ok(())
}

fn handle_supports(pre: &dyn Preprocessor, sub_args: &ArgMatches) -> ! {
    let renderer = sub_args.get_one::<String>("renderer").expect("Required argument");

    // Signal whether the renderer is supported by exiting with 1 or 0.
    if pre.supports_renderer(renderer).unwrap_or(false) {
        process::exit(0);
    } else {
        process::exit(1);
    }
}

mod footnote_lib {
    use super::*;

    pub struct Footnote;

    impl Footnote {
        pub fn new() -> Footnote {
            Footnote
        }
    }

    impl Preprocessor for Footnote {
        fn name(&self) -> &str {
            "footnote-preprocessor"
        }

        fn run(&self, _ctx: &PreprocessorContext, book: Book) -> Result<Book> {
            mdbook_footnote::replacing(book)
        }

        fn supports_renderer(&self, renderer: &str) -> Result<bool> {
            Ok(renderer != "not-supported")
        }
    }
}
