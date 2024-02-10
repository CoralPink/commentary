import { Fzf, byStartAsc } from 'fzf';

const LOWER_LIMIT_SCORE = 30;

export default class Finder {
  #fzf;
  #storeDocs;

  constructor(storeDocs, limit) {
    this.#storeDocs = storeDocs;

    /** @see https://github.com/HillLiu/docker-mdbook */
    this.#fzf = new Fzf(Object.keys(storeDocs), {
      limit,
      selector: x => `${this.#storeDocs[x].title} ${this.#storeDocs[x].body}`,
      tiebreakers: [byStartAsc],
    });
  }

  #findScoreBoundaries(array) {
    let low = 0;
    let high = array.length - 1;
    let resultIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      if (array[mid].score >= LOWER_LIMIT_SCORE) {
        resultIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return resultIndex !== -1 ? resultIndex : low;
  }

  search(term) {
    const results = this.#fzf.find(term);

    return results
      .slice(0, this.#findScoreBoundaries(results) + 1)
      .map(x => ({ doc: this.#storeDocs[x.item], key: x.item, score: x.score }));
  }
}
