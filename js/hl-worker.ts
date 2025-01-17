import hljs from './highlight.js/build/highlight.js';

const DELETEING_PREFIX = 'language-'.length;

const NERD_FONT_RANGE = /[\uE000-\uF8FF]/;
const containsNerdFontIcon = (text: string) => NERD_FONT_RANGE.test(text);

interface PostMessageData {
  highlightCode: string;
  needNerdFonts: boolean;
}

self.onmessage = (ev: MessageEvent<string[]>): void => {
  const highlightCode = hljs.highlight(ev.data[0], {
    language: ev.data[1].slice(DELETEING_PREFIX),
    ignoreIllegals: true,
  }).value;

  const needNerdFonts = containsNerdFontIcon(ev.data[0]);

  postMessage({ highlightCode, needNerdFonts } as PostMessageData);
};
