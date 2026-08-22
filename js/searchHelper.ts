const TARGET_SEARCH_BUTTON = 'search-btn';
const TARGET_SEARCH_POP = 'search-pop';

export const getSearchButton = (): HTMLElement | null => document.getElementById(TARGET_SEARCH_BUTTON);
export const getSearchPop = (): HTMLElement | null => document.getElementById(TARGET_SEARCH_POP);

// NOTE: I'd rather not, but I have to use `getElementById` every time.
export const isSearchPopoverOpen = (): boolean => getSearchPop()?.matches(':popover-open') ?? false;

export const focusSearchBar = (): void => {
  document.getElementById('searchbar')?.focus();
};
