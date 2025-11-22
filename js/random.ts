const fallbackRandomHexId = (): string => {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);

  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const randomUUID: () => string =
  typeof globalThis.crypto === 'object' && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID.bind(globalThis.crypto)
    : fallbackRandomHexId;

export const getRandomId = (): string => randomUUID();
