import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Platform,
  type KeyboardEvent,
} from 'react-native';

/** Matches the iOS keyboard animation curve. */
const KEYBOARD_EASING = Easing.bezier(0.17, 0.59, 0.4, 0.77);

/**
 * Keyboard overlap in px, animated in sync with the system keyboard on iOS.
 * Stays 0 on Android — the window already resizes there.
 */
export function useKeyboardOverlap() {
  const overlap = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const sub = Keyboard.addListener('keyboardWillChangeFrame', (e: KeyboardEvent) => {
      const next = Math.max(0, Dimensions.get('window').height - e.endCoordinates.screenY);
      Animated.timing(overlap, {
        toValue: next,
        duration: e.duration || 250,
        easing: KEYBOARD_EASING,
        useNativeDriver: false,
      }).start();
    });

    return () => sub.remove();
  }, [overlap]);

  return overlap;
}
