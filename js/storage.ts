export const writeLocalStorage = (keyName: string, keyValue: string): void => {
  try {
    localStorage.setItem(keyName, keyValue);
  } catch (e) {
    console.log(`ERROR: ${keyName} ${keyValue}\n${e}`);
  }
};
