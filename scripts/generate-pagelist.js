import beautify from 'js-beautify';
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import * as cheerio from 'cheerio';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';

const HTML_INPUT = 'toc.html';
const HTML_OUTPUT = 'pagelist.html';

const read = (path, options) => {
  try {
    return readFileSync(path, options);
  } catch (error) {
    console.error('Error reading toc.html', error.message);
    process.exit(1);
  }
};

const minified = html =>
  beautify.html(html, {
    indent_size: 0,
    max_preserve_newlines: 0,
    wrap_line_length: 0,
  });

(() => {
  const start = performance.now();
  const $ = cheerio.load(read(HTML_INPUT, 'utf8'));

  $('.chapter-item.expanded').removeClass('chapter-item expanded');
  $('a[target="_parent"]').removeAttr('target');

  $('li').each((_, li) => {
    const $li = $(li);
    const text = $li.text().trim();

    if (text === '' && !$li.hasClass('part-title')) {
      $li.remove();
      return;
    }

    if ($li.attr('class') === '') {
      $li.attr('class', null);
    }
  });

  try {
    writeFileSync(HTML_OUTPUT, minified($.html()));
  } catch (error) {
    console.error('Error writing pagelist.html', error.message);
    process.exit(1);
  }

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`\n${CLR_BG}✔ ${CLR_BC}generate-pagelist${CLR_RESET} Finished in ${CLR_BG}${time} s${CLR_RESET}`);
})();
