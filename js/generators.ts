export function* reverseItr<T>(array: T[]): Generator<T | undefined> {
  for (let i = array.length - 1; i >= 0; i--) {
    yield array[i];
  }
}
