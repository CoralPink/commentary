const fallbackRandomHexId = (): string => {
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);

  const hex = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
};

const randomUUID: () => string =
  typeof globalThis.crypto === 'object' && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID.bind(globalThis.crypto)
    : fallbackRandomHexId;

export const getRandomId = (): string => randomUUID();
