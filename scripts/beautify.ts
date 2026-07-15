import beautify from 'js-beautify';

export const compressHtml = (html: string): string =>
  beautify.html(html, {
    indent_size: 0,
    max_preserve_newlines: 0,
    wrap_line_length: 0,
  });

