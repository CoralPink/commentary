import { vi } from 'vitest';

type MatchResult = {
  index: { start: number; end: number }[];
  hadMatch: boolean;
};

export const mockFinderConstruct = vi.fn<(...args: unknown[]) => void>();
export const mockFinderSearch = vi.fn<(query: string) => Uint8Array>();
export const mockInitWasm = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
export const mockGetMatchSentences = vi.fn<(term: string, text: string | null) => MatchResult>();

export default mockInitWasm;
export const get_match_sentences = mockGetMatchSentences;

export class Finder {
  constructor(...args: unknown[]) {
    mockFinderConstruct(...args);
  }

  search(query: string): Uint8Array {
    return mockFinderSearch(query);
  }
}
