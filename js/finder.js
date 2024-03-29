import { Fzf, byStartAsc } from 'fzf';

const LOWER_LIMIT_SCORE = 56;

export default class Finder {
  #fzf;

  #docs = {};
  #titles = [];

  constructor(storeDocs, limit) {
    for (const key of Object.keys(storeDocs)) {
      // The `id` is discarded and the `title` is retained separately.
      const { id, title, ...rest } = storeDocs[key];

      this.#titles.push(title);
      this.#docs[key] = rest;
    }

    /** @see https://github.com/HillLiu/docker-mdbook */
    this.#fzf = new Fzf(Object.keys(this.#docs), {
      limit,
      selector: x => `${this.#titles[x]} ${this.#docs[x].body}`,
      tiebreakers: [byStartAsc],
    });
  }

  #filterSatisfactory(array) {
    if (array.length === 0 || array[0].score < LOWER_LIMIT_SCORE) {
      // I am not sure if it is a spec or not, but sometimes fzf returns a negative score.
      // I'm unwilling to do so, but I'll deal with it anyway using filters.
      return array.filter(x => x.score >= 0);
    }

    let low = 1; // '0' is already checked, so start with '1'
    let high = array.length - 1;

    let idx = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      if (array[mid].score < LOWER_LIMIT_SCORE) {
        idx = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return idx >= 0 ? array.slice(0, idx) : array;
  }

  search(term) {
    return this.#filterSatisfactory(this.#fzf.find(term)).map(x => ({
      doc: this.#docs[x.item],
      key: x.item,
      score: x.score,
    }));
  }
}
