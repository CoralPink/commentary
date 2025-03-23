use js_sys::Object;
use wasm_bindgen::JsValue;

pub fn convert_js_map_to_vec(obj: JsValue) -> Result<Vec<JsValue>, JsValue> {
    let obj = Object::try_from(&obj).ok_or_else(|| JsValue::from_str("Failed to convert to Object"))?;
    Ok(Object::values(obj).to_vec())
}
