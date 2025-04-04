use macros::error;
use wasm_bindgen::prelude::*;
use web_sys::Element;

#[wasm_bindgen]
pub fn attribute_external_links() {
    let document = match web_sys::window() {
        Some(win) => win.document(),
        None => {
            macros::console_error!("Document not available");
            return;
        }
    };

    let article = match document.and_then(|doc| doc.get_element_by_id("article")) {
        Some(article) => article,
        None => {
            macros::console_error!("Element with id 'article' not found");
            return;
        }
    };

    let node_list = match article.query_selector_all(r#"a[href^="http://"], a[href^="https://"]"#) {
        Ok(node_list) => node_list,
        Err(_) => {
            macros::console_error!("Failed to select external links");
            return;
        }
    };

    (0..node_list.length())
        .filter_map(|i| node_list.item(i))
        .filter_map(|n| n.dyn_into::<Element>().ok())
        .for_each(|el| {
            if el.set_attribute("target", "_blank").is_err() {
                macros::console_error!("Failed to set attribute on element");
            }
        });
}

#[cfg(test)]
#[allow(dead_code)]
mod tests {
    use macros::log;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_test::*;
    use web_sys::Element;

    const TEST_URLS: &[&str] = &[
        "http://example.com",
        "https://example.com",
        "https://example.com/abc.html",
        "example.html",
        "../example.html",
        "#1",
        "http.html",
        "http/example.html",
    ];

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_attribute_external_links() -> Result<(), String> {
        /* 1. Creating test cases. */
        let document = web_sys::window()
            .and_then(|win| win.document())
            .ok_or("Document not available")?;

        let article = document
            .create_element("article")
            .map_err(|_| "Failed to create article element")?;

        article.set_id("article");

        document
            .body()
            .ok_or("Body not available")?
            .append_child(&article)
            .map_err(|_| "Failed to append article to body")?;

        let create_test_case = |url: &str| -> Result<(), String> {
            let link = document
                .create_element("a")
                .map_err(|_| "Failed to create link element")?;

            link.set_attribute("href", url)
                .map_err(|_| format!("Failed to set href: {url}"))?;

            article
                .append_child(&link)
                .map_err(|_| "Failed to append link to article")?;

            Ok(())
        };

        for &url in TEST_URLS {
            create_test_case(url)?;
        }

        /* 2. Call the function under test. */
        super::attribute_external_links();

        /* 3. Validate results. */
        let node_list = document
            .get_element_by_id("article")
            .ok_or("Element with id 'article' not found")?
            .query_selector_all("a")
            .map_err(|_| "Failed to select links")?;

        (0..node_list.length())
            .filter_map(|i| node_list.item(i))
            .filter_map(|n| n.dyn_into::<Element>().ok())
            .try_for_each(|el| {
                let href = el.get_attribute("href").unwrap_or_default();

                if href.starts_with("http://") || href.starts_with("https://") {
                    assert_eq!(
                        el.get_attribute("target").ok_or("target attribute not found")?,
                        "_blank"
                    );
                    macros::console_log!("[OK] _blank: {href}");
                } else {
                    assert!(el.get_attribute("target").is_none());
                    macros::console_log!("[OK]   none: {href}");
                }
                Ok(())
            })
    }
}
