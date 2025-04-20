use macros::error;
use web_sys::{Element, Node};

fn get_article_content() -> Result<Element, String> {
    let window = web_sys::window().ok_or("window not available")?;
    let document = window.document().ok_or("document not available")?;

    let article = document
        .get_element_by_id("article")
        .ok_or("Element with id 'article' not found")?;

    Ok(article)
}

pub fn with_article<F>(f: F)
where
    F: FnOnce(Element),
{
    if let Ok(article) = get_article_content() {
        f(article);
    } else {
        macros::console_error!("Failed to get article element");
    }
}

pub fn with_article_nodes<F>(selector: &str, f: F)
where
    F: Fn(Node),
{
    with_article(|article| {
        if let Ok(nodes) = article.query_selector_all(selector) {
            (0..nodes.length()).filter_map(|i| nodes.item(i)).for_each(f);
        }
    });
}
