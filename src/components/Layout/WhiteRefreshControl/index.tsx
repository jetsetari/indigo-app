import React from 'react';
import { RefreshControl, RefreshControlProps, Platform } from 'react-native';

type Props = Omit<RefreshControlProps, 'tintColor' | 'colors' | 'progressBackgroundColor'>;

/**
 * Gesture-only refresh control. Visual feedback is handled by StickyHeader's
 * refreshing overlay — the system spinner is unreliable on black backgrounds.
 */
export default function WhiteRefreshControl(props: Props) {
  return (
    <RefreshControl
      {...props}
      // Keep native control mostly invisible; StickyHeader shows a white spinner.
      tintColor="transparent"
      colors={['transparent']}
      progressBackgroundColor={Platform.OS === 'android' ? '#000000' : undefined}
    />
  );
}
