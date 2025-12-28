export const ROOT_PATH = `${globalThis.location.origin}/commentary/`;

// Set the same value as the `breakpoint-ui-wide` used in CSS.
//
// TODO: Even when defined separately in JS and CSS, I believe the best approach is to create a flow detectable by testing,
//       but at this point, the method isn't clear...
export const BREAKPOINT_UI_WIDE = 1025;

// TODO: After Firefox 147 is released, delete it at an appropriate time!!
export const USE_LEGACY_NAVIGATION = !('navigation' in window);
