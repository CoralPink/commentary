const TARGET_SEARCH_BUTTON = 'search-btn';
const TARGET_SEARCH_POP = 'search-pop';
const TARGET_SEARCH_BAR = 'searchbar';

export const requireElement = <T extends HTMLElement>(id: string): T => {
  const elm = document.getElementById(id);

  if (elm === null) {
    throw new Error(`Element not found: #${id}`);
  }
  return elm as T;
};

export const getSearchButton = (): HTMLButtonElement => requireElement<HTMLButtonElement>(TARGET_SEARCH_BUTTON);
export const getSearchPop = (): HTMLDivElement => requireElement<HTMLDivElement>(TARGET_SEARCH_POP);
export const getSearchBar = (): HTMLInputElement => requireElement<HTMLInputElement>(TARGET_SEARCH_BAR);

// NOTE: I'd rather not, but I have to use `getElementById` every time.
export const isSearchPopoverOpen = (): boolean => getSearchPop().matches(':popover-open') ?? false;
