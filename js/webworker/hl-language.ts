const LANGUAGE_PREFIX = 'language-';
const LANGUAGE_PREFIX_LENGTH = LANGUAGE_PREFIX.length;
export const extractLanguage = (s: string): string =>
  s.startsWith(LANGUAGE_PREFIX) ? s.slice(LANGUAGE_PREFIX_LENGTH) : s;

// Unicode Private Use Area (PUA) range used by Nerd Fonts
const NERD_FONT_UNICODE_RANGE = /[\uE000-\uF8FF]/;
export const containsNerdFontIcon = (text: string): boolean => NERD_FONT_UNICODE_RANGE.test(text);
