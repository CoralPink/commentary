export const debounce = <T>(fn: (...args: T[]) => void, delay: number): ((...args: T[]) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T>(fn: (...args: T[]) => void, interval: number): ((...args: T[]) => void) => {
  let lastTime = 0;

  return (...args: T[]) => {
    const now = Date.now();

    if (now - lastTime >= interval) {
      fn(...args);
      lastTime = now;
    }
  };
};
