// src/components/Layout/FullBleed.tsx
import React from 'react';
import { View, ImageBackground, StyleSheet, SafeAreaView } from 'react-native';
import BgVideo from '../BgVideo';

type Props = {
  backgroundUri?: string | null;        // image fallback
  backgroundVideoUri?: string | null;   // video url (mp4/Vimeo)
  Top?: React.ReactNode;
  Center?: React.ReactNode;
  Bottom?: React.ReactNode;
  darkOverlay?: boolean;                // dims bg when true
  children?: React.ReactNode;           // absolute overlay slot (play btn, timer, etc.)
};

export default function FullBleed({
  backgroundUri,
  backgroundVideoUri,
  Top,
  Center,
  Bottom,
  darkOverlay = true,
  children,
}: Props) {
  const showVideo = !!backgroundVideoUri;

  return (
    <View style={s.root}>
      {showVideo ? (
        <>
          <BgVideo
            source={{ uri: backgroundVideoUri! }}
            autoPlay
            loop
            muted
            resizeMode="cover"
            coverImage={backgroundUri||undefined}
          />
          {darkOverlay && <View style={s.overlay} />}
        </>
      ) : (
        <>
          {backgroundUri ? (
            <ImageBackground source={{ uri: backgroundUri }} style={s.bg} resizeMode="cover" />
          ) : (
            <View style={s.bg} />
          )}
          {darkOverlay && <View style={s.overlay} />}
        </>
      )}

      <SafeAreaView style={s.safe}>
        <View style={s.top}>{Top}</View>
        <View style={s.center}>{Center}</View>
        <View style={s.bottom}>{Bottom}</View>
      </SafeAreaView>

      {!!children && <View pointerEvents="box-none" style={s.overlaySlot}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 10, backgroundColor: '#000' },
  bg: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.80)' },
  safe: { flex: 1, paddingHorizontal: 12 },
  top: { minHeight: 44, justifyContent: 'flex-start' },
  center: { flex: 1, justifyContent: 'flex-end' },
  bottom: { paddingBottom: 16, gap: 12 },
  overlaySlot: { ...StyleSheet.absoluteFillObject },
});
