// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSearchBar, getSearchButton, getSearchPop, isSearchPopoverOpen, requireElement } from '@/searchHelper.ts';

describe('searchHelper', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('requireElement', () => {
    it('returns the element with the requested ID', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.append(element);

      expect(requireElement<HTMLDivElement>('test-element')).toBe(element);
    });

    it('throws when the element does not exist', () => {
      expect(() => requireElement('missing-element')).toThrow('Element not found: #missing-element');
    });
  });

  it('gets the search button, popover, and search bar by ID', () => {
    const button = document.createElement('button');
    button.id = 'search-btn';

    const popover = document.createElement('div');
    popover.id = 'search-pop';

    const searchBar = document.createElement('input');
    searchBar.id = 'searchbar';

    document.body.append(button, popover, searchBar);

    expect(getSearchButton()).toBe(button);
    expect(getSearchPop()).toBe(popover);
    expect(getSearchBar()).toBe(searchBar);
  });

  it('reports whether the search popover is open', () => {
    const popover = document.createElement('div');
    popover.id = 'search-pop';
    document.body.append(popover);

    const matches = vi.spyOn(popover, 'matches');

    matches.mockReturnValue(true);
    expect(isSearchPopoverOpen()).toBe(true);

    matches.mockReturnValue(false);
    expect(isSearchPopoverOpen()).toBe(false);

    expect(matches).toHaveBeenCalledWith(':popover-open');
  });
});
