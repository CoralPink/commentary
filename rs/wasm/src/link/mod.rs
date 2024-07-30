use js_sys::Array;
use wasm_bindgen::prelude::*;
use web_sys::{Element, NodeList};

fn node_list_to_array(node_list: NodeList) -> Array {
    Array::from(&node_list)
}

#[wasm_bindgen]
pub fn attribute_external_links() {
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();

    let node_array = node_list_to_array(
        document
            .get_element_by_id("main")
            .expect("id 'main' not found")
            .query_selector_all(r#"a[href^="http://"], a[href^="https://"]"#)
            .unwrap(),
    );

    for node in node_array.iter() {
        if let Some(el) = node.dyn_ref::<Element>() {
            el.set_attribute("target", "_blank").unwrap();
        }
    }
}

#[cfg(test)]
mod tests {
    use macros::log;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_test::*;
    use web_sys::{Document, Element};

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_attribute_external_links() {
        /* 1. Creating test cases. */
        let window = web_sys::window().unwrap();
        let document: Document = window.document().unwrap();

        let main = document.create_element("div").unwrap();
        main.set_id("main");

        document.body().unwrap().append_child(&main).unwrap();

        let create_test_case = |url: &str| {
            let link = document.create_element("a").unwrap();
            link.set_attribute("href", url).unwrap();

            main.append_child(&link).unwrap();
        };

        create_test_case("http://example.com");
        create_test_case("https://example.com");
        create_test_case("https://example.com/abc.html");

        create_test_case("example.html");
        create_test_case("../example.html");
        create_test_case("#1");

        create_test_case("http.html");
        create_test_case("http/example.html");

        /* 2. Call the function under test. */
        super::attribute_external_links();

        /*
         * 3. If the `href` of the link starts with "http", check whether the "_blank" attribute is given to "target",
         *    otherwise check that the "target" attribute is not present.
         */
        let node_array = super::node_list_to_array(
            document
                .get_element_by_id("main")
                .expect("id 'main' not found")
                .query_selector_all("a")
                .unwrap(),
        );

        for node in node_array.iter() {
            if let Some(el) = node.dyn_ref::<Element>() {
                let href = el.get_attribute("href").unwrap_or_default();

                if href.starts_with("http://") || href.starts_with("https://") {
                    assert_eq!(el.get_attribute("target").unwrap(), "_blank");
                    macros::console_log!("[OK] _blank: {href}");
                } else {
                    assert!(el.get_attribute("target").is_none());
                    macros::console_log!("[OK]   none: {href}");
                }
            }
        }
    }
}
