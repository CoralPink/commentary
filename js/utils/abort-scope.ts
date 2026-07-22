/**
 * Manages a single active AbortController.
 * Calling begin() disposes the previous scope.
 */
export const createAbortScope = () => {
  let controller: AbortController | null = null;

  const dispose = (): void => {
    controller?.abort();
    controller = null;
  };

  const begin = (): AbortSignal => {
    dispose();

    controller = new AbortController();

    return controller.signal;
  };

  return {
    begin,
    dispose,
  };
};
