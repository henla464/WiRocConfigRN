import React, {useCallback, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';

/**
 * Keeps its content above the keyboard, the way the window used to be resized
 * by `android:windowSoftInputMode="adjustResize"` before Android enforced
 * edge-to-edge display (which made that setting a no-op). Use it as the root of
 * a screen (or modal) that contains text inputs.
 *
 * `KeyboardAvoidingView` does the shrinking, but it calculates how much of
 * itself is covered by the keyboard from its position *within its parent*
 * (`frame.y`) while comparing that against the keyboard's position *on screen*.
 * That only works out when the view sits at the very top of the screen - below
 * a tab bar, or nested inside another view, it shrinks by too little (or not at
 * all). We measure our actual position on screen and pass the difference as
 * `keyboardVerticalOffset` so the calculation comes out right anywhere.
 *
 * `style` is applied to the content container, not to the keyboard-avoiding
 * view itself.
 */
export const KeyboardAvoidingContainer = ({
  style,
  children,
  ...props
}: ViewProps) => {
  const [keyboardVerticalOffset, setKeyboardVerticalOffset] = useState(0);
  const contentRef = useRef<View | null>(null);
  // Position of the content container within the keyboard-avoiding view, and of
  // the keyboard-avoiding view within its parent.
  const contentRelativeYRef = useRef(0);
  const containerRelativeYRef = useRef(0);

  const updateKeyboardVerticalOffset = useCallback(() => {
    contentRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
      setKeyboardVerticalOffset(
        pageY - contentRelativeYRef.current - containerRelativeYRef.current,
      );
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
      onLayout={event => {
        containerRelativeYRef.current = event.nativeEvent.layout.y;
        updateKeyboardVerticalOffset();
      }}
      {...props}>
      <View
        ref={contentRef}
        style={[styles.content, style]}
        onLayout={event => {
          contentRelativeYRef.current = event.nativeEvent.layout.y;
          updateKeyboardVerticalOffset();
        }}
        collapsable={false}>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
