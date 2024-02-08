import { Fzf, byStartAsc } from 'fzf';

const LOWER_LIMIT_SCORE = 30;

export default class Finder {
  #fzf;
  #storeDocs;

  search(term) {
    return this.#fzf
      .find(term)
      .map(x => ({ doc: this.#storeDocs[x.item], key: x.item, score: x.score }))
      .filter(y => y.score >= LOWER_LIMIT_SCORE);
  }

  constructor(storeDocs, limit) {
    /** @see https://github.com/HillLiu/docker-mdbook */
    this.#fzf = new Fzf(Object.keys(storeDocs), {
      limit,
      selector: x => `${storeDocs[x].title} ${storeDocs[x].body}`,
      tiebreakers: [byStartAsc],
    });

    this.#storeDocs = storeDocs;
  }
}
