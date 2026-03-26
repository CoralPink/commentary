use getset::Getters;
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
        self.body_lower = self.body.to_lowercase();
        self.breadcrumbs_lower = self.breadcrumbs.to_lowercase();

        self
    }
}
