/*
// @ts-expect-error: Sanitizer API.
const supportsSafeHTML = 'Sanitizer' in globalThis && typeof Element.prototype.setHTML === 'function';
*/

// FIXME:
// Since the default settings cause `<iframe>` to be removed, you need to configure it properly,
// but I don't feel like doing that today, so let's use `setHTMLUnsafe()` instead.
const supportsSafeHTML = false;
const sanitizer = supportsSafeHTML ? new Sanitizer({}) : null;

type SetHTML = (el: HTMLElement, html: string) => void;

const setHTMLImpl: SetHTML = supportsSafeHTML
  ? //@ts-expect-error: setHTML() is experimental
    (el, html) => el.setHTML(html, { sanitizer })
  : (el, html) => el.setHTMLUnsafe(html);

export const setHTML = (el: HTMLElement, html: string): void => {
  setHTMLImpl(el, html);
};
