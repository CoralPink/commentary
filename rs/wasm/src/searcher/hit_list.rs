use crate::searcher::algo::score;
use crate::searcher::constants::*;
use crate::searcher::doc::DocObject;

use getset::Getters;
use std::ops::{Deref, DerefMut};

/// Character used to split header breadcrumbs
const SCORE_HEADER_PARSE: char = '»';

/// Calculates a relevance score for a search term within a document header.
/// The score is boosted inversely proportional to header length, with the boost
/// decaying at a rate controlled by SCORE_HEADER_LENGTH_DECAY_EXPONENT.
///
/// # Arguments
/// * `term` - The search term to match
/// * `breadcrumbs` - The document header path with sections separated by '»'
///
/// # Returns
/// A weighted score with higher values for shorter headers
fn get_header_score(term: &str, breadcrumbs: &str) -> usize {
    breadcrumbs
        .split(SCORE_HEADER_PARSE)
        .map(str::trim)
        .next_back()
        .map(|header| {
            let len = header.len().max(1) as f32;
            let boost = SCORE_HEADER_BOOST_BASE * (1.0 / len.powf(SCORE_HEADER_LENGTH_DECAY_EXPONENT));

            (score::compute(term, header) as f32 * boost).round() as usize
        })
        .unwrap_or(0)
}

fn get_body_score(term: &str, body: &str) -> usize {
    score::compute(term, body)
}

/// Represents a single search result with its relevance score.
/// Contains a reference to the matched document and its parsed ID.
#[derive(Getters)]
pub struct Hit<'a> {
    #[get = "pub"]
    doc: &'a DocObject,
    #[get = "pub"]
    score: usize,
    #[get = "pub"]
    id: usize,
}

/// A collection of search hits with a fixed maximum capacity.
/// Provides methods for scoring, merging, and ranking search results.
#[derive(Default)]
pub struct HitList<'a>(Vec<Hit<'a>>);

impl HitList<'_> {
    pub fn new() -> Self {
        Self::default()
    }
}

impl<'a> Deref for HitList<'a> {
    type Target = Vec<Hit<'a>>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> From<HitList<'a>> for Vec<Hit<'a>> {
    fn from(m: HitList<'a>) -> Self {
        m.0
    }
}

impl DerefMut for HitList<'_> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl<'a> IntoIterator for HitList<'a> {
    type Item = Hit<'a>;
    type IntoIter = <Vec<Hit<'a>> as IntoIterator>::IntoIter;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<'a> HitList<'a> {
    pub fn from_token_set(normalized_terms: &'a [String], docs: &'a [&'a DocObject]) -> Self {
        let mut results = Vec::with_capacity(LIMIT_RESULTS / normalized_terms.len().max(1));

        for doc in docs {
            let mut score = 0;

            for token in normalized_terms.iter().map(|s| s.as_str()) {
                score += get_header_score(token, doc.breadcrumbs());
                score += get_body_score(token, doc.body());
            }

            if score < SCORE_LOWER_LIMIT {
                continue;
            }

            if let Ok(id) = doc.id().parse::<usize>() {
                results.push(Hit { doc, score, id });
            }
        }

        results.sort_unstable_by(|a, b| b.score.cmp(&a.score).then_with(|| a.id.cmp(&b.id)));
        results.truncate(LIMIT_RESULTS);

        Self(results)
    }
}
