mod function;
mod search_result;

use serde::Deserialize;

pub const ARRAY_VEC_SIZE: usize = 512;
pub const RESULT_ID_START: usize = 1;

#[derive(Deserialize)]
pub struct DocObject {
    pub body: String,
    pub breadcrumbs: String,
}

#[derive(Deserialize)]
pub struct ResultObject {
    pub doc: DocObject,
    pub key: String,
    pub score: u16,
}

pub struct HighlightedToken {
    pub text: String,
    pub position: usize,
    pub importance: usize,
}
