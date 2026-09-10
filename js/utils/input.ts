import { isSafariBrowser } from './platform.ts';
import { debounce } from './timing.ts';

const DEFAULT_DEBOUNCE_DELAY_MS = 80;

/**
 * Set up the Safari-specific IME workaround for an input element.
 *
 * Safari may dispatch `compositionend` before the `keydown` event for the Enter key that commits the composition.
 * This makes `KeyboardEvent.isComposing` insufficient to distinguish that Enter from a normal Enter keydown.
 *
 * The workaround is intentionally limited to Safari because the event order
 * observed in other tested browsers allows `KeyboardEvent.isComposing` to handle the composition-confirming Enter correctly.
 *
 * @param element The input element to listen to.
 * @param signal The AbortSignal used to remove the event listener.
 * @param onCompositionEnd Called when composition ends on Safari.
 */
const setupSafariImeWorkaround = (
  element: HTMLInputElement,
  signal: AbortSignal,
  onCompositionEnd: () => void,
): void => {
  if (!isSafariBrowser()) {
    return;
  }

  element.addEventListener('compositionend', onCompositionEnd, {
    passive: true,
    signal,
  });
};

/**
 * Listen for input and keyboard events on an input element.
 *
 * Input callbacks are debounced by the specified delay. Keyboard events are
 * passed to the `onKeydown` callback unless the event is part of IME composition.
 *
 * A Safari-specific workaround is also installed to account for Safari's different composition and keyboard event ordering.
 *
 * The utility does not interpret keyboard keys itself; callers can decide
 * which keys or keyboard actions they want to handle in `onKeydown`.
 *
 * @param element The input element to listen to.
 * @param signal The AbortSignal used to remove the event listeners.
 * @param onInput Called after an input event, debounced by `debounceDelayMs`.
 * @param onKeydown Called for keyboard events outside of IME composition.
 * @param debounceDelayMs The debounce delay in milliseconds. Defaults to `DEFAULT_DEBOUNCE_DELAY_MS`.
 */
export const listenToInputEvents = (
  element: HTMLInputElement,
  signal: AbortSignal,
  onInput: () => void,
  onKeydown: (ev: KeyboardEvent) => void,
  debounceDelayMs: number = DEFAULT_DEBOUNCE_DELAY_MS,
): void => {
  let skipComposedEnter = false;

  const debounceInput = debounce((_: InputEvent) => onInput(), debounceDelayMs);

  element.addEventListener('input', debounceInput, {
    passive: true,
    signal,
  });

  element.addEventListener(
    'keydown',
    (ev: KeyboardEvent) => {
      if (ev.isComposing || skipComposedEnter) {
        skipComposedEnter = false;
        return;
      }

      onKeydown(ev);
    },
    {
      passive: false,
      signal,
    },
  );

  setupSafariImeWorkaround(element, signal, () => {
    skipComposedEnter = true;
  });
};
