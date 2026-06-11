use crate::searcher::algo::score;
use crate::searcher::constants::*;
use crate::searcher::doc::DocObject;

use getset::Getters;

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
    pub score: usize,
    pub id: usize,

    #[get = "pub"]
    doc: &'a DocObject,
}

#[derive(Default)]
pub struct HitList<'a>(Vec<Hit<'a>>);

impl<'a> IntoIterator for HitList<'a> {
    type Item = Hit<'a>;
    type IntoIter = <Vec<Hit<'a>> as IntoIterator>::IntoIter;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

pub struct HitScorer<'a> {
    terms: &'a [String],
    first_chars: Vec<char>,
}

impl<'a> HitScorer<'a> {
    pub fn new(terms: &'a [String]) -> Self {
        let first_chars = terms.iter().filter_map(|t| t.chars().next()).collect();

        Self { terms, first_chars }
    }

    fn calc(&self, doc: &DocObject) -> usize {
        let mut score = 0;

        for token in self.terms.iter().map(|s| s.as_str()) {
            score += get_header_score(token, doc.breadcrumbs());
            score += get_body_score(token, doc.body());
        }

        score
    }

    pub fn compute<'b, I>(&self, docs: I) -> HitList<'b>
    where
        I: IntoIterator<Item = &'b DocObject>,
    {
        let mut results = Vec::with_capacity(LIMIT_RESULTS / self.terms.len().max(1));

        for doc in docs {
            let body = doc.body_lower();
            let crumbs = doc.breadcrumbs_lower();

            if !self
                .first_chars
                .iter()
                .all(|c| body.contains(*c) || crumbs.contains(*c))
            {
                continue;
            }

            let score = self.calc(doc);
            if score < SCORE_LOWER_LIMIT {
                continue;
            }

            if let Ok(id) = doc.id().parse::<usize>() {
                results.push(Hit { doc, score, id });
            }
        }

        results.sort_unstable_by(|a, b| b.score.cmp(&a.score).then_with(|| a.id.cmp(&b.id)));

        results.truncate(LIMIT_RESULTS);

        HitList(results)
    }
}
