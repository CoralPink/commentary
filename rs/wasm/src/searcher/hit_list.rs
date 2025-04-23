use crate::searcher::algo::score;
use crate::searcher::finder::DocObject;

use arrayvec::ArrayVec;
use std::ops::{Deref, DerefMut};

/// maximum number of search results
pub const LIMIT_RESULTS: usize = 100;

/// Base multiplier for header match scores
const SCORE_HEADER_BOOST_BASE: f32 = 8.0;
/// Controls how quickly the header boost decays as header length increases
const SCORE_HEADER_LENGTH_DECAY_EXPONENT: f32 = 0.4;
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
pub struct Hit<'a> {
    pub doc: &'a DocObject,
    pub score: usize,
    pub id: usize,
}

/// A collection of search hits with a fixed maximum capacity.
/// Provides methods for scoring, merging, and ranking search results.
pub struct HitList<'a>(ArrayVec<Hit<'a>, LIMIT_RESULTS>);

impl Default for HitList<'_> {
    fn default() -> Self {
        HitList(ArrayVec::new())
    }
}

impl HitList<'_> {
    pub fn new() -> Self {
        Self::default()
    }
}

impl<'a> Deref for HitList<'a> {
    type Target = ArrayVec<Hit<'a>, LIMIT_RESULTS>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> From<HitList<'a>> for ArrayVec<Hit<'a>, LIMIT_RESULTS> {
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
    type IntoIter = <ArrayVec<Hit<'a>, LIMIT_RESULTS> as IntoIterator>::IntoIter;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<'a> HitList<'a> {
    pub fn merge(mut self, ml: HitList<'a>) -> Self {
        for x in ml {
            if let Some(existing) = self.iter_mut().find(|y| y.id == x.id) {
                existing.score += x.score;
                continue;
            }
            if self.len() < LIMIT_RESULTS {
                self.push(x);
            }
        }
        self
    }

    pub fn from_matches(term: &str, docs: impl IntoIterator<Item = &'a DocObject>) -> Self {
        let mut results: Vec<Hit<'a>> = docs
            .into_iter()
            .filter_map(|doc| {
                let score = get_header_score(term, doc.breadcrumbs()) + get_body_score(term, doc.body());

                if score == 0 {
                    return None;
                }
                if let Ok(id) = doc.id().parse::<usize>() {
                    Some(Hit { doc, score, id })
                } else {
                    None
                }
            })
            .collect();

        results.sort_by(|a, b| b.score.cmp(&a.score).then_with(|| a.id.cmp(&b.id)));
        Self(results.into_iter().take(LIMIT_RESULTS).collect())
    }

    pub fn from_token_set<T, D>(tokens: T, docs: D, min_score: usize) -> Self
    where
        T: IntoIterator<Item = &'a str>,
        D: IntoIterator<Item = &'a DocObject>,
    {
        let docs: Vec<&DocObject> = docs.into_iter().collect();

        let mut combined = tokens
            .into_iter()
            .map(|token| Self::from_matches(token, docs.iter().copied()))
            .reduce(Self::merge)
            .unwrap_or_default();

        combined.retain(|x| x.score >= min_score);
        combined.sort_by(|a, b| b.score.cmp(&a.score));
        combined.truncate(LIMIT_RESULTS);

        combined
    }
}
