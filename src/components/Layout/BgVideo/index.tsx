// src/components/Layout/BgVideo/index.tsx
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView, VideoContentFit } from 'expo-video';

/**
 * Accepts either a local require() (number) or a remote URI.
 * If the URI is a Vimeo link, we render the official Vimeo player via WebView.
 */
export type BgVideoSource = number | { uri: string };

export type BgVideoProps = {
  source: BgVideoSource;

  /** Background defaults: autoplay, loop, muted */
  loop?: boolean;          // default: true
  autoPlay?: boolean;      // default: true
  muted?: boolean;         // default: true

  /** How the video fits its container (default 'cover') */
  resizeMode?: VideoContentFit; // 'cover' | 'contain' | 'fill' | 'scale-down'

  /** Optional overlay to darken/lighten the video */
  overlayStyle?: ViewStyle;

  /** Extra style for the actual video/webview layer */
  videoStyle?: ViewStyle;

  /** Vimeo-only param overrides */
  vimeoParams?: Partial<{
    autoplay: 0 | 1;
    loop: 0 | 1;
    background: 0 | 1;
    muted: 0 | 1;
    controls: 0 | 1;
    quality: 'auto' | '4k' | '2k' | '1080p' | '720p' | '540p' | '360p';
  }>;
};

function isVimeoUrl(u?: string) {
  if (!u) return false;
  return /(^https?:\/\/)?(player\.)?vimeo\.com/.test(u);
}

function extractVimeoId(url: string): string | null {
  // Supports: https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
  const match =
    url.match(/vimeo\.com\/(?:video\/)?(\d+)/) ||
    url.match(/player\.vimeo\.com\/video\/(\d+)/);
  return match?.[1] ?? null;
}

/** Native (expo-video) background player */
const BgVideoNative: React.FC<
  Required<Pick<BgVideoProps, 'source'>> &
  Pick<BgVideoProps, 'loop' | 'autoPlay' | 'muted' | 'resizeMode' | 'videoStyle'>
> = ({ source, loop = true, autoPlay = true, muted = true, resizeMode = 'cover', videoStyle }) => {
  const player = useVideoPlayer(source, (p) => {
    p.loop = loop;
    p.muted = muted;
    if (autoPlay) p.play();
  });

  return (
    <VideoView
      style={[styles.absoluteFill, videoStyle]}
      player={player}
      contentFit={resizeMode}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      nativeControls={false}   // ensure no OS controls
      pointerEvents="none"     // ignore taps (true background)
    />
  );
};

/** Vimeo background via WebView (controls hidden, muted by default) */
const BgVideoVimeo: React.FC<
  Required<Pick<BgVideoProps, 'source'>> &
  Pick<BgVideoProps, 'autoPlay' | 'loop' | 'muted' | 'vimeoParams' | 'videoStyle'>
> = ({ source, autoPlay = true, loop = true, muted = true, vimeoParams, videoStyle }) => {
  const uri = (source as any).uri as string;

  const vimeoEmbedUrl = useMemo(() => {
    const id = extractVimeoId(uri);
    if (!id) return null;

    const params = new URLSearchParams({
      autoplay: String(vimeoParams?.autoplay ?? (autoPlay ? 1 : 0)),
      loop: String(vimeoParams?.loop ?? (loop ? 1 : 0)),
      background: String(vimeoParams?.background ?? 1),     // background mode
      muted: String(vimeoParams?.muted ?? (muted ? 1 : 0)), // muted
      controls: String(vimeoParams?.controls ?? 0),         // hide controls
      quality: String(vimeoParams?.quality ?? 'auto'),
      playsinline: '1',
      transparent: '0',
    }).toString();

    return `https://player.vimeo.com/video/${id}?${params}`;
  }, [uri, autoPlay, loop, muted, vimeoParams]);

  if (!vimeoEmbedUrl) return null;

  return (
    <WebView
      style={[styles.absoluteFill, videoStyle]}
      source={{ uri: vimeoEmbedUrl }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      scrollEnabled={false}
      bounces={false}
      automaticallyAdjustContentInsets={false}
      androidHardwareAccelerationDisabled={false}
      setSupportMultipleWindows={false}
      pointerEvents="none"     // ignore taps (true background)
    />
  );
};

/** Public component: picks native vs Vimeo automatically */
const BgVideo: React.FC<BgVideoProps> = ({
  source,
  loop = true,
  autoPlay = true,
  muted = true,
  resizeMode = 'cover',
  overlayStyle,
  videoStyle,
  vimeoParams,
}) => {
  const isRemote = typeof source === 'object' && !!(source as any)?.uri;
  const uri = isRemote ? (source as any).uri as string : undefined;
  const useVimeo = isRemote && isVimeoUrl(uri);

  return (
    <View style={styles.container}>
      {useVimeo ? (
        <BgVideoVimeo
          source={source as { uri: string }}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          vimeoParams={vimeoParams}
          videoStyle={videoStyle}
        />
      ) : (
        <BgVideoNative
          source={source}
          loop={loop}
          autoPlay={autoPlay}
          muted={muted}
          resizeMode={resizeMode}
          videoStyle={videoStyle}
        />
      )}

      {overlayStyle ? (
        <View pointerEvents="none" style={[styles.absoluteFill, overlayStyle]} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  absoluteFill: { ...StyleSheet.absoluteFillObject },
});

export default memo(BgVideo);
