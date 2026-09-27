import {RefObject, useCallback, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';

// Keep a small gap between the focused input and the keyboard.
export const INPUT_KEYBOARD_MARGIN = 16;
// The keyboard (and the KeyboardAvoidingView) animate in - measure once settled.
const SETTLE_DELAY_MS = 250;

/**
 * Keeps the focused text input visible when the keyboard is shown.
 *
 * Android 16 (targetSdk 36) enforces edge-to-edge display, which turns
 * `android:windowSoftInputMode="adjustResize"` into a no-op: the window is no
 * longer resized when the keyboard appears, so it simply covers the bottom of
 * the screen instead of pushing the content up.
 *
 * The ScrollView this is used with should live inside a
 * `KeyboardAvoidingContainer` (as `KeyboardAwareScrollView` assumes), so that
 * switching between inputs keeps them above the keyboard. `keyboardHeight` is
 * non-zero while the keyboard is visible; `INPUT_KEYBOARD_MARGIN` is all the
 * bottom padding the content container needs, since the container has already
 * taken the keyboard's height off the view (adding the keyboard height again
 * here would let the content be scrolled far past its end). `onScroll` must be
 * attached to the scroll view so we know its offset.
 */
export const useKeyboardAwareScroll = (
  scrollViewRef: RefObject<ScrollView | null>,
) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardTopRef = useRef<number | null>(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, event => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = null;
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Scroll the input that is focused when the keyboard opens above the
  // keyboard. The scroll view won't do this by itself: the input already has
  // focus, so no focus event is emitted when the keyboard appears. Later focus
  // changes are handled by the scroll view, since the KeyboardAvoidingView
  // keeps its bounds above the keyboard.
  useEffect(() => {
    if (keyboardHeight === 0 || scrollViewRef.current == null) {
      return;
    }

    const timeout = setTimeout(() => {
      const focusedInput = TextInput.State.currentlyFocusedInput();
      const keyboardTop = keyboardTopRef.current;

      if (focusedInput == null || keyboardTop == null) {
        return;
      }

      focusedInput.measure((_x, _y, _width, height, _pageX, pageY) => {
        if (pageY == null) {
          return;
        }

        const overflow = pageY + height + INPUT_KEYBOARD_MARGIN - keyboardTop;

        if (overflow > 0) {
          scrollViewRef.current?.scrollTo({
            x: 0,
            y: scrollOffsetRef.current + overflow,
            animated: true,
          });
        }
      });
    }, SETTLE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [keyboardHeight, scrollViewRef]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  return {keyboardHeight, onScroll};
};
