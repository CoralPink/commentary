export type UUID = string & { readonly __brand: unique symbol };

const fallbackRandomUUID = (): string => {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);

  // Set version 4 in byte 6 and variant in byte 8
  array[6] = (array[6]! & 0x0f) | 0x40;
  array[8] = (array[8]! & 0x3f) | 0x80;

  const hex = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

const createUUID: () => string =
  typeof globalThis.crypto === 'object' && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID.bind(globalThis.crypto)
    : fallbackRandomUUID;

export const getUUID = (): UUID => createUUID() as UUID;
