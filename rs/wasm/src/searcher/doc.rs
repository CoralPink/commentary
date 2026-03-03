use getset::Getters;
use html_escape::encode_safe;
use serde::Deserialize;

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
    pub fn sanitize(mut self) -> Self {
        self.id = encode_safe(&self.id).into_owned();
        self.title = encode_safe(&self.title).into_owned();

        let body = encode_safe(&self.body).into_owned();
        let breadcrumbs = encode_safe(&self.breadcrumbs).into_owned();

        self.body = body.clone();
        self.breadcrumbs = breadcrumbs.clone();

        self.body_lower = body.to_lowercase();
        self.breadcrumbs_lower = breadcrumbs.to_lowercase();

        self
    }
}
