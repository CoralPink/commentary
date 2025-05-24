export const writeLocalStorage = (keyName: string, keyValue: string): void => {
  try {
    localStorage.setItem(keyName, keyValue);
  } catch (e) {
    console.error(`ERROR: ${keyName} ${keyValue}\n${e}`);
  }
};
