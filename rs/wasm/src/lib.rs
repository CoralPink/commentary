use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn draw() {
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();

    let app = document.get_element_by_id("wasm-test").unwrap();
    app.set_inner_html("<p>ごめんなさい...。このURLは無効です...🙀</p>");
}
