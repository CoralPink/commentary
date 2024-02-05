import { Fzf, byStartAsc } from 'fzf';

export default class Finder {
  #fzf;
  #storeDocs;

  search(term) {
    return this.#fzf.find(term).map(data => ({ doc: this.#storeDocs[data.item], ref: data.item, score: data.score }));
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
