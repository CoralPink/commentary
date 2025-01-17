import hljs from './highlight.js/build/highlight';

const DELETEING_PREFIX = 'language-'.length;

// Unicode Private Use Area (PUA) range used by Nerd Fonts
const NERD_FONT_UNICODE_RANGE = /[\uE000-\uF8FF]/;
const containsNerdFontIcon = (text: string) => NERD_FONT_UNICODE_RANGE.test(text);

interface PostMessageData {
  highlightCode: string;
  needNerdFonts: boolean;
}

self.onmessage = (ev: MessageEvent<[string, string]>): void => {
  const highlightCode = hljs.highlight(ev.data[0], {
    language: ev.data[1].slice(DELETEING_PREFIX),
    ignoreIllegals: true,
  }).value;

  const needNerdFonts = containsNerdFontIcon(ev.data[0]);

  postMessage({ highlightCode, needNerdFonts } as PostMessageData);
};
