// @ts-expect-error: Sanitizer API.
const supportsSafeHTML = 'Sanitizer' in globalThis && typeof Element.prototype.setHTML === 'function';
// @ts-expect-error: Sanitizer API.
const sanitizer = supportsSafeHTML ? new Sanitizer({}) : null;

type SetHTML = (el: HTMLElement, html: string) => void;

const setHTMLImpl: SetHTML = supportsSafeHTML
  ? //@ts-expect-error: setHTML() is experimental
    (el, html) => el.setHTML(html, { sanitizer })
  : (el, html) => el.setHTMLUnsafe(html);

export const setHTML = (el: HTMLElement, html: string): void => {
  setHTMLImpl(el, html);
};
