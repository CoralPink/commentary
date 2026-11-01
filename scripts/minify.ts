import { Buffer } from 'node:buffer';
import minify_html from '@minify-html/node';

export const minifyHtml = (html: string): string =>
  minify_html
    .minify(Buffer.from(html), {
      keep_comments: false,
      keep_closing_tags: false,
      keep_html_and_head_opening_tags: false,
      keep_input_type_text_attr: false,
      keep_ssi_comments: false,

      allow_noncompliant_unquoted_attribute_values: true,
      allow_optimal_entities: true,
      allow_removing_spaces_between_attributes: true,

      minify_doctype: true,
      minify_css: true,
      minify_js: true,
    })
    .toString();
