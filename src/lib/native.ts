export type NativeHapticStyle = 'light' | 'medium' | 'success' | 'error';

type MathLiftBridge = {
  postMessage: (message: unknown) => void;
};

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        mathlift?: MathLiftBridge;
      };
    };
  }
}

const hasNativeBridge = () => Boolean(window.webkit?.messageHandlers?.mathlift);

const postToNative = (message: Record<string, string>) => {
  try {
    window.webkit?.messageHandlers?.mathlift?.postMessage(message);
  } catch {
    // Browser or web preview — ignore.
  }
};

const capacitorHaptic = async (style: NativeHapticStyle) => {
  try {
    const cap = (
      window as Window & {
        Capacitor?: {
          isNativePlatform?: () => boolean;
          Plugins?: {
            Haptics?: {
              impact?: (opts: { style: string }) => Promise<void>;
              notification?: (opts: { type: string }) => Promise<void>;
            };
          };
        };
      }
    ).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    const haptics = cap.Plugins?.Haptics;
    if (!haptics) return;
    if (style === 'success') {
      await haptics.notification?.({ type: 'SUCCESS' });
      return;
    }
    if (style === 'error') {
      await haptics.notification?.({ type: 'ERROR' });
      return;
    }
    await haptics.impact?.({ style: style === 'medium' ? 'MEDIUM' : 'LIGHT' });
  } catch {
    // Capacitor plugin not present.
  }
};

/** Ask the iPhone Taptic Engine for a short click. No-ops in a regular browser. */
export const nativeHaptic = (style: NativeHapticStyle = 'light') => {
  if (hasNativeBridge()) {
    postToNative({ action: 'haptic', style });
    return;
  }
  void capacitorHaptic(style);
};

const isInteractive = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, [role="button"], a, input[type="submit"], input[type="button"]'
    )
  );
};

/** Light haptic on every native-feeling tap (buttons and links). */
export const installNativeHaptics = () => {
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (isInteractive(event.target)) {
      nativeHaptic('light');
    }
  };
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
};
