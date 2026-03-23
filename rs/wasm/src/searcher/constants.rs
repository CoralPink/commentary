/// Maximum number of search results
pub const LIMIT_RESULTS: usize = 100;
/// Maximum number of search words (entering more words than this will simply be ignored).
pub const SEARCH_TERM_MAX: usize = 8;

/// Message displayed when the requirements for starting a search have not been met
pub const INITIAL_MESSAGE: &str = "2文字 (or 全角1文字) 以上を入力してください...";

// Minimum required search match score
pub const SCORE_LOWER_LIMIT: usize = 64;
/// Base multiplier for header match scores
pub const SCORE_HEADER_BOOST_BASE: f32 = 8.0;
/// Controls how quickly the header boost decays as header length increases
pub const SCORE_HEADER_LENGTH_DECAY_EXPONENT: f32 = 0.4;

/// Number of words considered for teaser/highlight calculation.
pub const TEASER_WORD_COUNT: usize = 256;

/// Fonts used in the score bar
pub const SCORE_BAR_CHARACTER: &str = "▰";
/// Rate used to calculate the length of the scorebar
pub const SCORE_BAR_RATE: usize = 8;
/// Maximum value displayed on the score bar (does not affect the actual score)
pub const SCORE_BAR_MAX: usize = 256;

/// Estimated maximum number of tokens for a single document.
pub const EXCERPT_TOKENS_MAX: usize = 24;
