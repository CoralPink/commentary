use crate::searcher::js_util::*;

use getset::Getters;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;
use wasm_bindgen::JsValue;

#[derive(Deserialize, Getters)]
pub struct DocObject {
    #[get = "pub"]
    id: String,
    #[get = "pub"]
    title: String,
    #[get = "pub"]
    body: String,
    #[get = "pub"]
    breadcrumbs: String,

    #[serde(skip)]
    #[get = "pub"]
    body_lower: String,

    #[serde(skip)]
    #[get = "pub"]
    breadcrumbs_lower: String,
}

impl DocObject {
    fn initialize(mut self) -> Self {
        self.body_lower = self.body.to_lowercase();
        self.breadcrumbs_lower = self.breadcrumbs.to_lowercase();

        self
    }

    pub fn vec_from_js(docs: JsValue) -> Result<Vec<Self>, JsValue> {
        convert_js_map_to_vec(docs)?
            .into_iter()
            .map(|jsv| from_value::<Self>(jsv).map(Self::initialize).map_err(JsValue::from))
            .collect()
    }

    #[cfg(test)]
    pub fn dummy(id: &str, title: &str, body: &str, breadcrumbs: &str) -> Self {
        let s = Self {
            id: id.into(),
            title: title.into(),
            body: body.to_string(),
            breadcrumbs: breadcrumbs.into(),
            body_lower: String::new(),
            breadcrumbs_lower: String::new(),
        };

        s.initialize()
    }
}
