import { Fzf, byStartAsc } from 'fzf';

const LOWER_LIMIT_SCORE = 30;

export default class Finder {
  #fzf;
  #storeDocs;

  search(term) {
    return this.#fzf
      .find(term)
      .map(data => ({ doc: this.#storeDocs[data.item], ref: data.item, score: data.score }))
      .filter(x => x.score >= LOWER_LIMIT_SCORE);
  }

  constructor(storeDocs, limit) {
    /** @see https://github.com/HillLiu/docker-mdbook */
    this.#fzf = new Fzf(Object.keys(storeDocs), {
      limit,
      selector: item => `${storeDocs[item].breadcrumbs}${storeDocs[item].body}`,
      tiebreakers: [byStartAsc],
    });

    this.#storeDocs = storeDocs;
  }
}
