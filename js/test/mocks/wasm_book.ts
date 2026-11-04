import { vi } from 'vitest';

export const mockFinderConstruct = vi.fn<(...args: unknown[]) => void>();
export const mockFinderSearch = vi.fn<(query: string) => Uint8Array>();
export const mockInitWasm = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

export default mockInitWasm;

export class Finder {
  constructor(...args: unknown[]) {
    mockFinderConstruct(...args);
  }

  search(query: string): Uint8Array {
    return mockFinderSearch(query);
  }
}
