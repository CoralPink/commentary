export type Disposer = () => void;
export type ExtensionInitializeFn = (html: HTMLElement) => Disposer;

export type InitializableExtension = {
  initialize?: ExtensionInitializeFn;
};

export type ExtensionEntry = {
  importPromise: Promise<void>;
  initialize: ExtensionInitializeFn | undefined;
};
