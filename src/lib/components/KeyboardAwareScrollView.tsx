import React, {forwardRef, useCallback, useRef} from 'react';
import {ScrollView, ScrollViewProps, StyleSheet} from 'react-native';

import {
  INPUT_KEYBOARD_MARGIN,
  useKeyboardAwareScroll,
} from '@lib/hooks/useKeyboardAwareScroll';

/**
 * Drop-in replacement for `ScrollView` that scrolls the focused text input
 * above the keyboard.
 *
 * The keyboard is overlaid on top of the screen (see
 * `useKeyboardAwareScroll`), so the scroll view can't rely on the window being
 * resized to keep the input visible: the input that is already focused when the
 * keyboard appears is scrolled into view here. Use `KeyboardAvoidingContainer`
 * as the root of the screen so the scroll view itself is shortened to the space
 * above the keyboard - that is what keeps the content visible, so only a small
 * margin is added below it while the keyboard is shown (adding its full height
 * would let the content be scrolled well past its end).
 */
export const KeyboardAwareScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function KeyboardAwareScrollView(
    {children, contentContainerStyle, onScroll, ...scrollViewProps},
    forwardedRef,
  ) {
    const scrollViewRef = useRef<ScrollView | null>(null);
    const {keyboardHeight, onScroll: handleScroll} =
      useKeyboardAwareScroll(scrollViewRef);

    const setScrollViewRef = useCallback(
      (node: ScrollView | null) => {
        scrollViewRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    return (
      <ScrollView
        ref={setScrollViewRef}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        onScroll={event => {
          handleScroll(event);
          onScroll?.(event);
        }}
        contentContainerStyle={[
          StyleSheet.flatten(contentContainerStyle),
          keyboardHeight > 0 && {paddingBottom: INPUT_KEYBOARD_MARGIN},
        ]}
        {...scrollViewProps}>
        {children}
      </ScrollView>
    );
  },
);
