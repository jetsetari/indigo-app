// src/components/Layout/BgVideo/index.tsx
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Image, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView, VideoContentFit } from 'expo-video';
import { Dimensions } from 'react-native';

export type BgVideoSource = number | { uri: string };

export type BgVideoProps = {
  source: BgVideoSource;
  loop?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  resizeMode?: VideoContentFit; // 'cover' | 'contain' | 'fill' | 'scale-down'
  overlayStyle?: ViewStyle;
  videoStyle?: ViewStyle;
  vimeoParams?: Partial<{
    autoplay: 0 | 1; loop: 0 | 1; background: 0 | 1; muted: 0 | 1; controls: 0 | 1;
    quality: 'auto' | '4k' | '2k' | '1080p' | '720p' | '540p' | '360p';
  }>;
  coverImage?: string;
};
const { width, height } = Dimensions.get('window');
const isVimeoUrl = (u?: string) => !!u && /(^https?:\/\/)?(player\.)?vimeo\.com/.test(u);
const extractVimeoId = (url: string) =>
  (url.match(/vimeo\.com\/(?:video\/)?(\d+)/) || url.match(/player\.vimeo\.com\/video\/(\d+)/))?.[1] ?? null;

/* ---------- Native (expo-video) ---------- */
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
      style={[StyleSheet.absoluteFill, videoStyle]}
      player={player}
      contentFit={resizeMode}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      nativeControls={false}
      pointerEvents="none"
    />
  );
};

/* ---------- Vimeo (WebView) ---------- */
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
      background: String(vimeoParams?.background ?? 1),
      muted: String(vimeoParams?.muted ?? (muted ? 1 : 0)),
      controls: String(vimeoParams?.controls ?? 0),
      quality: String(vimeoParams?.quality ?? 'auto'),
      playsinline: '1',
      transparent: '0',
    }).toString();
    return `https://player.vimeo.com/video/${id}?${params}`;
  }, [uri, autoPlay, loop, muted, vimeoParams]);

  if (!vimeoEmbedUrl) return null;

  const html = `<!doctype html>
    <html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
    <style>
      html,body{margin:0;height:100%;overflow:hidden;background:#000}
      .wrap{position:fixed;inset:0;overflow:hidden;background:#000}
      /* 16:9 cover hack: fill and crop like object-fit: cover */
      .frame{
        position:absolute;top:50%;left:50%;
        width:100vw;height:56.25vw;           /* 9/16 = 0.5625 */
        min-width:177.78vh;min-height:100vh;  /* 16/9 = 1.7778 */
        transform:translate(-50%,-50%);
        border:0;
      }
    </style>
    </head><body>
      <div class="wrap">
        <iframe class="frame"
          src="${vimeoEmbedUrl}"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </body></html>`;

    return (
      <WebView
        source={{ html }}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}
        containerStyle={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        scrollEnabled={false}
        bounces={false}
        setSupportMultipleWindows={false}
        pointerEvents="none"
      />
    );
};

/* ---------- Public ---------- */
const BgVideo: React.FC<BgVideoProps> = ({
  source,
  loop = true,
  autoPlay = true,
  muted = true,
  resizeMode = 'cover',
  overlayStyle,
  videoStyle,
  vimeoParams,
  coverImage
}) => {
  const isRemote = typeof source === 'object' && !!(source as any)?.uri;
  const uri = isRemote ? ((source as any).uri as string) : undefined;
  const useVimeo = isRemote && isVimeoUrl(uri);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      {coverImage ? (
        <ImageBackground
          source={{ uri: coverImage }}
          style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
          resizeMode='cover'
        />
      ) : null}
    </View>
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
      
      {overlayStyle ? <View style={[StyleSheet.absoluteFill, overlayStyle]} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // absolutely pin to the parent; no margins, full screen
  container: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});

export default memo(BgVideo);
