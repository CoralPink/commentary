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
}

impl DocObject {
    pub fn sanitize(mut self) -> Self {
        self.id = encode_safe(&self.id).into_owned();
        self.title = encode_safe(&self.title).into_owned();
        self.body = encode_safe(&self.body).into_owned();
        self.breadcrumbs = encode_safe(&self.breadcrumbs).into_owned();

        self
    }
}
