export const writeLocalStorage = (keyName, keyValue) => {
  try {
    localStorage.setItem(keyName, keyValue);
  } catch (e) {
    console.log(`ERROR: ${keyName} ${keyValue}\n${e}`);
  }
};
