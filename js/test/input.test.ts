// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listenToInputEvents } from '@/utils/input.ts';

const mocks = vi.hoisted(() => ({
  isSafariBrowser: vi.fn<() => boolean>(),
}));

vi.mock('@/utils/platform.ts', () => ({
  isSafariBrowser: mocks.isSafariBrowser,
}));

const createInput = (): HTMLInputElement => {
  document.body.innerHTML = '<input type="search" />';
  return document.querySelector('input')!;
};

const createKeydown = (isComposing: boolean): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    cancelable: true,
  });

  Object.defineProperty(event, 'isComposing', { value: isComposing });
  return event;
};

describe('listenToInputEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.isSafariBrowser.mockReset().mockReturnValue(false);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces input events until the delay has elapsed', async () => {
    const input = createInput();
    const controller = new AbortController();
    const onInput = vi.fn();

    listenToInputEvents(input, controller.signal, onInput, vi.fn(), 25);

    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(20);

    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(24);

    expect(onInput).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(onInput).toHaveBeenCalledOnce();
  });

  it('does not pass composing keydowns to the keyboard callback', () => {
    const input = createInput();
    const controller = new AbortController();
    const onKeydown = vi.fn();

    listenToInputEvents(input, controller.signal, vi.fn(), onKeydown);

    const composingEnter = createKeydown(true);
    input.dispatchEvent(composingEnter);

    expect(onKeydown).not.toHaveBeenCalled();

    const regularEnter = createKeydown(false);
    input.dispatchEvent(regularEnter);

    expect(onKeydown).toHaveBeenCalledOnce();
    expect(onKeydown).toHaveBeenCalledWith(regularEnter);
  });

  it('skips the Enter keydown following compositionend in Safari', () => {
    mocks.isSafariBrowser.mockReturnValue(true);

    const input = createInput();
    const controller = new AbortController();
    const onKeydown = vi.fn();

    listenToInputEvents(input, controller.signal, vi.fn(), onKeydown);

    input.dispatchEvent(new CompositionEvent('compositionend'));
    input.dispatchEvent(createKeydown(false));

    expect(onKeydown).not.toHaveBeenCalled();

    input.dispatchEvent(createKeydown(false));

    expect(onKeydown).toHaveBeenCalledOnce();
  });

  it('does not install the Safari workaround in other browsers', () => {
    mocks.isSafariBrowser.mockReturnValue(false);

    const input = createInput();
    const controller = new AbortController();
    const onKeydown = vi.fn();

    listenToInputEvents(input, controller.signal, vi.fn(), onKeydown);

    input.dispatchEvent(new CompositionEvent('compositionend'));
    input.dispatchEvent(createKeydown(false));

    expect(onKeydown).toHaveBeenCalledOnce();
  });

  it('removes event listeners when the signal is aborted', () => {
    const input = createInput();
    const controller = new AbortController();
    const onInput = vi.fn();
    const onKeydown = vi.fn();

    listenToInputEvents(input, controller.signal, onInput, onKeydown);

    controller.abort();

    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(createKeydown(false));
    input.dispatchEvent(new CompositionEvent('compositionend'));

    expect(onInput).not.toHaveBeenCalled();
    expect(onKeydown).not.toHaveBeenCalled();
  });
});
