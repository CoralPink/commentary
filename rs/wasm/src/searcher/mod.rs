mod function;
mod score;
mod search_result;

use serde::Deserialize;

pub const ARRAY_VEC_SIZE: usize = 512;
pub const RESULT_ID_START: usize = 1;

#[derive(Clone, Deserialize)]
pub struct DocObject {
    pub id: String,
    pub title: String,
    pub body: String,
    pub breadcrumbs: String,
}

pub struct ResultObject {
    pub doc: DocObject,
    pub key: String,
    pub score: usize,
}

pub struct HighlightedToken {
    pub text: String,
    pub position: usize,
    pub importance: usize,
}
