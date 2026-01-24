import * as g from './global.ts';

import * as cheerio from 'cheerio';
import { isHtml } from 'cheerio/utils';

import beautify from 'js-beautify';

const HTML_OUTPUT = `${g.PATH_DIRECTORY}pagelist.html`;

const read = async (path: string): Promise<string> => {
  try {
    return await Deno.readTextFile(path);
  } catch (error: unknown) {
    console.error(`Error reading ${path}: ${error}`);
    Deno.exit(1);
  }
};

const write = async (file: string, data: string): Promise<void> => {
  try {
    await Deno.writeTextFile(file, data);
  } catch (error: unknown) {
    console.error(`Error writing ${file}: ${error}`);
    Deno.exit(1);
  }
};

const minify = (html: string): string =>
  beautify.html(html, {
    indent_size: 0,
    max_preserve_newlines: 0,
    wrap_line_length: 0,
  });

const main = async (): Promise<void> => {
  const html = await read(`${g.PATH_DIRECTORY}${g.HTML_TOC}`);

  if (!isHtml(html)) {
    console.error(`${g.HTML_TOC} is not HTML!!`);
    Deno.exit(1);
  }

  const $ = cheerio.load(html);

  $('.chapter-item.expanded').removeClass('chapter-item expanded');
  $('a[target="_parent"]').removeAttr('target');

  // In Mdbook v0.5, <span> tags are inserted, but this site removes them.
  $('span').each((_, span) => {
    const $span = $(span);
    $span.replaceWith($span.html() ?? '');
  });

  $('li').each((_, li) => {
    const $li = $(li);
    const text = $li.text().trim();

    if (text === '' && !$li.hasClass('part-title')) {
      $li.remove();
      return;
    }

    if ($li.attr('class') === '') {
      $li.removeAttr('class');
    }
  });

  $('a[href]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href');

    if (!href) {
      return;
    }

    try {
      const linkUrl = new URL(href, g.rootPath);
      $a.attr('href', linkUrl.href);
    } catch (error: unknown) {
      console.error(`Error href ${href}: ${error}`);
      Deno.exit(1);
    }
  });

  await write(HTML_OUTPUT, minify($.html()));
};

(async () => {
  const start = performance.now();

  await main();

  const time = Math.floor(performance.now() - start) / 1000;

  console.info(`${g.CLR_BG}✔ ${g.CLR_BC}pagelist${g.CLR_RESET} Finished in ${g.CLR_BG}${time} s${g.CLR_RESET}`);
  console.info(` ${g.CLR_G}INFO${g.CLR_RESET} Build mode: ${g.isDebug ? 'debug' : 'production'}`);
  console.info(` ${g.CLR_G}INFO${g.CLR_RESET} rootPath = ${g.rootPath}\n`);
})();
