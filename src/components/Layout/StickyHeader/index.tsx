import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Animated,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from './StickyHeaderStyle';
import __base from '~/assets/styles/base';

type Props = {
  title: string;
  children: React.ReactNode;
  padded?: boolean;
  BgColor?: string;
  scrollRef?: React.RefObject<ScrollView>;
  noSticky?: boolean;
};

export default function StickyHeader({
  title,
  children,
  padded = true,
  BgColor = '#000000',
  scrollRef,
  noSticky = false,
}: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [darkBar, setDarkBar] = useState(false);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      setDarkBar(value > 100);
    });
    return () => scrollY.removeListener(id);
  }, []);

  // build the container style
  const containerStyle: StyleProp<ViewStyle> = padded
    ? [__base.container, { backgroundColor: BgColor }]
    // when not padded, ditch __base.container's padding
    : { flex: 1, backgroundColor: BgColor };

  // build the scroll content style
  const scrollContentStyle: StyleProp<ViewStyle> = padded
    ? {
        ...styles.scrollContainer,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 0,
        backgroundColor: BgColor,
      }
    : {
        ...styles.scrollContainer, // this has no built-in padding
        backgroundColor: BgColor,
      };

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <StatusBar style={darkBar ? 'light' : 'dark'} />

      {!noSticky && (
        <Animated.View
          style={[styles.stickyHeader, { opacity: scrollY.interpolate({
            inputRange: [80, 120],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }) }]}
        >
          <Text style={styles.stickyHeaderTitle}>{title}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={30}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.ScrollView
            ref={scrollRef}
            contentContainerStyle={scrollContentStyle}
            keyboardShouldPersistTaps="handled"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {children}
          </Animated.ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
