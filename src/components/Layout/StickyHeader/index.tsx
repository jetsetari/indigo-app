import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Animated,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  StyleSheet,
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
  refreshControl?: React.ReactElement;
  /** When true, shows a clear white spinner overlay (use with refreshControl). */
  refreshing?: boolean;
  scrollEnabled?: boolean;
};

export default function StickyHeader({
  title,
  children,
  padded = true,
  BgColor = '#000000',
  scrollRef,
  noSticky = false,
  refreshControl,
  refreshing = false,
  scrollEnabled = true,
}: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [darkBar, setDarkBar] = useState(false);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      setDarkBar(value > 100);
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const containerStyle: StyleProp<ViewStyle> = padded
    ? [__base.container, { backgroundColor: BgColor }]
    : { flex: 1, backgroundColor: BgColor };

  const scrollContentStyle: StyleProp<ViewStyle> = padded
    ? {
        ...styles.scrollContainer,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 0,
        backgroundColor: BgColor,
      }
    : {
        ...styles.scrollContainer,
        backgroundColor: BgColor,
      };

  // Plain ScrollView works reliably with RefreshControl.
  const usePlainScroll = !!refreshControl || noSticky;

  const sharedScrollProps = {
    contentContainerStyle: scrollContentStyle,
    keyboardShouldPersistTaps: 'handled' as const,
    refreshControl,
    bounces: true,
    alwaysBounceVertical: true,
    scrollEnabled,
    onScrollBeginDrag: Keyboard.dismiss,
    scrollEventThrottle: 16 as const,
  };

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <StatusBar style={darkBar ? 'light' : 'dark'} />

      {!noSticky && (
        <Animated.View
          style={[
            styles.stickyHeader,
            {
              opacity: scrollY.interpolate({
                inputRange: [80, 120],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.stickyHeaderTitle}>{title}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={30}
      >
        {usePlainScroll ? (
          <ScrollView
            ref={scrollRef}
            {...sharedScrollProps}
            onScroll={(e) => {
              if (!noSticky) scrollY.setValue(e.nativeEvent.contentOffset.y);
            }}
          >
            {children}
          </ScrollView>
        ) : (
          <Animated.ScrollView
            ref={scrollRef}
            {...sharedScrollProps}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
          >
            {children}
          </Animated.ScrollView>
        )}
      </KeyboardAvoidingView>

      {refreshing ? (
        <View style={overlayStyles.wrap} pointerEvents="none">
          <View style={overlayStyles.badge}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    elevation: 50,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
