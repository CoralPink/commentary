import { Fzf, byStartAsc } from 'fzf';
import type { FzfResultItem, FzfOptions } from 'fzf';

const LOWER_LIMIT_SCORE = 56;

interface StoreDoc {
  id: string;
  title: string;
  body: string;
  key: string;
}

interface SearchResult {
  doc: Omit<StoreDoc, 'id' | 'title'>;
  key: string;
  score: number;
}

export default class Finder {
  private fzf: Fzf<string[]>;

  private docs: Record<string, Omit<StoreDoc, 'id' | 'title'>> = {};
  private titles: string[] = [];

  constructor(storeDocs: Record<string, StoreDoc>, limit: number) {
    for (const [key, { id, title, ...rest }] of Object.entries(storeDocs)) {
      this.titles.push(title);
      this.docs[key] = rest;
    }

    const options: FzfOptions<string> = {
      limit,
      selector: x => `${this.titles[+x]} ${this.docs[x].body}`,
      tiebreakers: [byStartAsc],
    };

    this.fzf = new Fzf(Object.keys(this.docs), options);
  }

  private filterSatisfactory(array: FzfResultItem<string>[]): FzfResultItem<string>[] {
    if (array.length === 0 || array[0].score < LOWER_LIMIT_SCORE) {
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

  public search(term: string): SearchResult[] {
    const results = this.filterSatisfactory(this.fzf.find(term));
    return results.map(x => ({
      doc: this.docs[x.item],
      key: x.item,
      score: x.score,
    }));
  }
}
