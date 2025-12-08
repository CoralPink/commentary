export type Disposer = () => void;
export type ExtensionInitializeFn = (html: HTMLElement) => () => void;

export type InitializableExtension = {
  initialize?: ExtensionInitializeFn;
};

export type ExtensionEntry = {
  importPromise: Promise<void>;
  initialize: ExtensionInitializeFn | undefined;
};
