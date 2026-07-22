export const createEventScope = () => {
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
