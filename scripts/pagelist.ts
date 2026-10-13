import * as g from './global.ts';
import { compressHtml } from './beautify.ts';

import * as cheerio from 'cheerio';
import { isHtml } from 'cheerio/utils';
import { readFile, writeFile } from 'node:fs/promises';

const HTML_OUTPUT = `${g.PATH_DIRECTORY}pagelist.html`;

const read = (path: string): Promise<string> => readFile(path, 'utf8');

const write = async (file: string, data: string): Promise<void> => {
  await writeFile(file, data, 'utf8');
};

const main = async (): Promise<void> => {
  const html = await read(`${g.PATH_DIRECTORY}${g.HTML_TOC}`);

  if (!isHtml(html)) {
    throw new Error(`${g.HTML_TOC} is not HTML!!`);
  }

  const $ = cheerio.load(html);

  // Normalize HTML attributes
  $('html').attr('lang') ?? $('html').attr('lang', 'ja');

  $('.chapter-item.expanded').removeClass('chapter-item expanded');
  $('a[target="_parent"]').removeAttr('target');
  $('nav[role="navigation"]').removeAttr('role');

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
      throw new Error(`Error href ${href}`, { cause: error });
    }
  });

  await write(HTML_OUTPUT, compressHtml($.html()));
};

(async (): Promise<void> => {
  const start = performance.now();

  try {
    await main();

    const time = Math.floor(performance.now() - start);

    console.info(`${g.CLR_BG}✔ ${g.CLR_BC}pagelist${g.CLR_RESET} Finished in ${g.CLR_BG}${time} ms${g.CLR_RESET}`);
    console.info(`${g.CLR_G}INFO${g.CLR_RESET} mode: ${g.isDebug ? 'debug' : 'production'}`);
    console.info(`${g.CLR_G}INFO${g.CLR_RESET} rootPath: ${g.rootPath}`);
  } catch (error: unknown) {
    console.error(error);
    process.exitCode = 1;
  }
})();
