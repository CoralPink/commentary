export function* reverseItr<T>(array: T[]): Generator<T> {
  for (let i = array.length - 1; i >= 0; i--) {
    yield array[i] as T;
  }
}
