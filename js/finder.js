import { Fzf, byStartAsc } from 'fzf';

const LOWER_LIMIT_SCORE = 56;

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

  #findFirstUnsatisfactoryIndexOrLast(array) {
    if (array.length === 0 || array.at(0).score < LOWER_LIMIT_SCORE) {
      return array.length;
    }

    let low = 0;
    let high = array.length - 1;
    let resultIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      if (array[mid].score < LOWER_LIMIT_SCORE) {
        resultIndex = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return resultIndex >= 0 ? resultIndex : array.length;
  }

  search(term) {
    const results = this.#fzf.find(term);
    const index = this.#findFirstUnsatisfactoryIndexOrLast(results);

    return results.slice(0, index).map(x => ({ doc: this.#storeDocs[x.item], key: x.item, score: x.score }));
  }
}
