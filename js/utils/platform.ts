/**
 * Determine whether the current device is running iOS or iPadOS.
 *
 * iPadOS may report `MacIntel` as the platform, so touch support is also
 * checked to distinguish it from macOS.
 */
export const isIOS = (): boolean =>
  /iPhone|iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Determine whether the current browser is Safari.
 *
 * This is intentionally a user-agent-based heuristic rather than feature
 * detection. It is used only for a Safari-specific IME workaround, where
 * Safari's composition and keyboard event ordering differs from other tested browsers.
 */
export const isSafariBrowser = (): boolean => {
  const ua = navigator.userAgent;
  return /Version\/\d.*Safari\/\d/.test(ua) && !/Chrome|CriOS|Firefox|Brave/.test(ua);
};

/**
 * Determine whether the current environment is WebKit-based.
 *
 * iOS browsers, including Firefox and Chrome, use WebKit and therefore
 * require the legacy implementation. Safari on macOS is also included.
 */
export const isWebkitBased = (): boolean => isIOS() || isSafariBrowser();
