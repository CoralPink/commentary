import { Fzf, extendedMatch } from 'fzf';

export default class Finder {
  #fzf;
  #storeDocs;

  search(term) {
    return this.#fzf.find(term).map(data => {
      return {
        doc: this.#storeDocs[data.item],
        ref: data.item,
        score: data.score,
      };
    });
  }

  constructor(storeDocs, limit) {
    /** @see https://github.com/HillLiu/docker-mdbook */
    this.#fzf = new Fzf(Object.keys(storeDocs), {
      limit,
      selector: item => {
        const res = storeDocs[item];
        return `${res.title}${res.breadcrumbs}${res.body}`;
      },
      tiebreakers: [
        (a, b, selector) => {
          return selector(a.item).trim().length - selector(b.item).trim().length;
        },
      ],
      match: extendedMatch,
    });

    this.#storeDocs = storeDocs;
  }
}
