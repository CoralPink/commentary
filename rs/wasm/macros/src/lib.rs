#[cfg(feature = "use-browser-console")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "use-browser-console")]
#[wasm_bindgen]
unsafe extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn error(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn info(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn warn(s: &str);
}

#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => {{
        #[cfg(feature = "use-browser-console")]
        log(&format_args!($($t)*).to_string())
    }};
}

#[macro_export]
macro_rules! console_error {
    ($($t:tt)*) => {{
        #[cfg(feature = "use-browser-console")]
        error(&format_args!($($t)*).to_string())
    }};
}

#[macro_export]
macro_rules! console_info {
    ($($t:tt)*) => {{
        #[cfg(feature = "use-browser-console")]
        info(&format_args!($($t)*).to_string())
    }};
}

#[macro_export]
macro_rules! console_warn {
    ($($t:tt)*) => {{
        #[cfg(feature = "use-browser-console")]
        warn(&format_args!($($t)*).to_string())
    }};
}
