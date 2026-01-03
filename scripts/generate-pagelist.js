import beautify from 'js-beautify';
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import * as cheerio from 'cheerio';

const CLR_RESET = '\x1b[0m';
const CLR_BC = '\x1b[1;35m';
const CLR_BG = '\x1b[1;32m';

const CLR_G = '\x1b[32m';

const HTML_INPUT = 'toc.html';
const HTML_OUTPUT = 'pagelist.html';

const URL_PRODUCTION = 'https://coralpink.github.io/commentary/';
const URL_LOCALHOST = 'http://localhost:8000/commentary/';

const args = process.argv.slice(2);

const getArgValue = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const rootFromArg = getArgValue('--root');
const isDebug = args.includes('--debug');

const rootPath = rootFromArg ?? (isDebug ? URL_LOCALHOST : URL_PRODUCTION);

const read = (path, options) => {
  try {
    return readFileSync(path, options);
  } catch (error) {
    console.error(`Error reading ${path}`, error.message);
    process.exit(1);
  }
};

const write = (file, data) => {
  try {
    writeFileSync(file, data);
  } catch (error) {
    console.error(`Error writing ${file}`, error.message);
    process.exit(1);
  }
};

const minify = html =>
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

  // In Mdbook v0.5, <span> tags are inserted, but this site removes them. (Future plans are undecided...)
  $('span').each((_, span) => {
    const $span = $(span);
    $span.replaceWith($span.html());
  });

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

  $('a[href]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href');

    if (!href) return;

    try {
      const linkUrl = new URL(href, rootPath);
      $a.attr('href', linkUrl.href);
    } catch {
      // Items that cannot be interpreted as URLs will be ignored.
    }
  });

  write(HTML_OUTPUT, minify($.html()));

  const time = Math.floor(performance.now() - start) / 1000;
  console.info(`\n${CLR_BG}√ ${CLR_BC}generate-pagelist${CLR_RESET} Finished in ${CLR_BG}${time} s${CLR_RESET}`);
  console.info(` ${CLR_G}INFO${CLR_RESET} Build mode: ${isDebug ? 'debug' : 'production'}`);
  console.info(` ${CLR_G}INFO${CLR_RESET} rootPath = ${rootPath}`);
})();
