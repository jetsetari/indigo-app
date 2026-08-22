// src/components/Layout/BgVideo/index.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View, ViewStyle, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView, VideoContentFit, VideoSource } from 'expo-video';
import {
  extractVimeoId,
  resolveVimeoStream,
  resolveVimeoThumbnail,
  VimeoQuality,
} from '~/data/helpers/vimeoStream';

export type BgVideoSource = VideoSource;

/** Soft dissolve between last/first frames when looping native video. */
const CROSSFADE_SEC = 2;

export type BgVideoProps = {
  source: BgVideoSource;
  loop?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  resizeMode?: VideoContentFit; // 'cover' | 'contain' | 'fill' | 'scale-down'
  overlayStyle?: ViewStyle;
  videoStyle?: ViewStyle;
  /** Dissolve loop ends into starts (native only). Default: on when loop is true. */
  crossfadeLoop?: boolean;
  vimeoParams?: Partial<{
    autoplay: 0 | 1; loop: 0 | 1; background: 0 | 1; muted: 0 | 1; controls: 0 | 1;
    quality: VimeoQuality;
  }>;
  coverImage?: string;
};

type NativeProps = {
  source: VideoSource;
  loop?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  resizeMode?: VideoContentFit;
  videoStyle?: ViewStyle;
  onReady?: () => void;
};

const sourceKey = (source: VideoSource) => {
  if (typeof source === 'number' || typeof source === 'string') return String(source);
  return (source as { uri?: string })?.uri ?? JSON.stringify(source);
};

const isVimeoUrl = (u?: string) => !!u && /(^https?:\/\/)?(player\.)?vimeo\.com/.test(u);

const isYouTubeUrl = (u?: string) =>
  !!u &&
  /(^https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(u);

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
};

export { isYouTubeUrl, extractYouTubeId };

const videoViewProps = {
  allowsFullscreen: false,
  allowsPictureInPicture: false,
  nativeControls: false,
  pointerEvents: 'none' as const,
};

/* ---------- Native hard loop / no loop ---------- */
const BgVideoNativeSimple: React.FC<NativeProps> = ({
  source,
  loop = true,
  autoPlay = true,
  muted = true,
  resizeMode = 'cover',
  videoStyle,
  onReady,
}) => {
  const player = useVideoPlayer(source, (p) => {
    p.loop = loop;
    p.muted = muted;
    if (autoPlay) p.play();
  });

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') onReady?.();
  });

  return (
    <VideoView
      style={[StyleSheet.absoluteFill, videoStyle]}
      player={player}
      contentFit={resizeMode}
      {...videoViewProps}
    />
  );
};

/* ---------- Native dissolve loop (dual player) ---------- */
// Android SurfaceView ignores opacity/overlap; TextureView is required for a real dissolve.
// Opacity must sit on the VideoView itself — parent Animated.View opacity often has no effect.
const AnimatedVideoView = Animated.createAnimatedComponent(VideoView);

const BgVideoNativeCrossfade: React.FC<NativeProps> = ({
  source,
  autoPlay = true,
  muted = true,
  resizeMode = 'cover',
  videoStyle,
  onReady,
}) => {
  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const activeRef = useRef<'a' | 'b'>('a');
  const crossfadingRef = useRef(false);
  const readyA = useRef(false);
  const readyB = useRef(false);
  const startedRef = useRef(false);
  const key = sourceKey(source);

  const playerA = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = muted;
    p.timeUpdateEventInterval = 0.05;
  });
  const playerB = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = muted;
    p.timeUpdateEventInterval = 0.05;
  });

  const prevKeyRef = useRef<string | null>(null);
  const startCrossfadeRef = useRef<() => void>(() => {});

  useEffect(() => {
    playerA.muted = muted;
    playerB.muted = muted;
  }, [muted, playerA, playerB]);

  const tryStart = useCallback(() => {
    if (startedRef.current) return;
    if (!readyA.current || !readyB.current) return;
    startedRef.current = true;
    onReady?.();
    if (autoPlay) {
      playerA.currentTime = 0;
      playerA.play();
    }
  }, [autoPlay, playerA, onReady]);

  const markReady = useCallback(
    (which: 'a' | 'b') => {
      if (which === 'a') readyA.current = true;
      else readyB.current = true;
      tryStart();
    },
    [tryStart],
  );

  // Catch ready status if it fired before listeners attached
  useEffect(() => {
    if (playerA.status === 'readyToPlay') markReady('a');
    if (playerB.status === 'readyToPlay') markReady('b');
  }, [playerA, playerB, markReady]);

  useEffect(() => {
    const isFirst = prevKeyRef.current === null;
    prevKeyRef.current = key;
    if (isFirst) return;

    activeRef.current = 'a';
    crossfadingRef.current = false;
    startedRef.current = false;
    readyA.current = playerA.status === 'readyToPlay';
    readyB.current = playerB.status === 'readyToPlay';
    opacityA.setValue(1);
    opacityB.setValue(0);
    try {
      playerA.pause();
      playerB.pause();
      playerA.currentTime = 0;
      playerB.currentTime = 0;
    } catch {
      // players may not be ready yet
    }
    if (readyA.current && readyB.current) {
      startedRef.current = true;
      onReady?.();
      if (autoPlay) playerA.play();
    }
  }, [key, playerA, playerB, opacityA, opacityB, autoPlay, onReady]);

  const startCrossfade = useCallback(() => {
    if (crossfadingRef.current) return;
    if (!readyA.current || !readyB.current) {
      const active = activeRef.current === 'a' ? playerA : playerB;
      active.currentTime = 0;
      active.play();
      return;
    }

    crossfadingRef.current = true;
    const fromA = activeRef.current === 'a';
    const from = fromA ? playerA : playerB;
    const to = fromA ? playerB : playerA;
    const fromOpacity = fromA ? opacityA : opacityB;
    const toOpacity = fromA ? opacityB : opacityA;
    // Prefer a long, visible dissolve; only shorten for very short clips
    const duration = from.duration > 0 ? from.duration : CROSSFADE_SEC;
    const fadeSec = duration < CROSSFADE_SEC * 2
      ? Math.max(0.35, duration * 0.4)
      : CROSSFADE_SEC;
    const durationMs = fadeSec * 1000;

    try {
      to.currentTime = 0;
      to.play();
    } catch {
      crossfadingRef.current = false;
      return;
    }

    fromOpacity.stopAnimation();
    toOpacity.stopAnimation();
    fromOpacity.setValue(1);
    toOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(fromOpacity, {
        toValue: 0,
        duration: durationMs,
        useNativeDriver: false, // required for VideoView opacity
      }),
      Animated.timing(toOpacity, {
        toValue: 1,
        duration: durationMs,
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        crossfadingRef.current = false;
        return;
      }
      try {
        from.pause();
        from.currentTime = 0;
      } catch {
        // ignore
      }
      activeRef.current = fromA ? 'b' : 'a';
      crossfadingRef.current = false;
    });
  }, [playerA, playerB, opacityA, opacityB]);

  startCrossfadeRef.current = startCrossfade;

  useEventListener(playerA, 'timeUpdate', ({ currentTime }) => {
    if (activeRef.current !== 'a' || crossfadingRef.current) return;
    const duration = playerA.duration;
    if (!duration || duration <= 0) return;
    const fadeSec = duration < CROSSFADE_SEC * 2
      ? Math.max(0.35, duration * 0.4)
      : CROSSFADE_SEC;
    if (currentTime >= duration - fadeSec) startCrossfadeRef.current();
  });
  useEventListener(playerB, 'timeUpdate', ({ currentTime }) => {
    if (activeRef.current !== 'b' || crossfadingRef.current) return;
    const duration = playerB.duration;
    if (!duration || duration <= 0) return;
    const fadeSec = duration < CROSSFADE_SEC * 2
      ? Math.max(0.35, duration * 0.4)
      : CROSSFADE_SEC;
    if (currentTime >= duration - fadeSec) startCrossfadeRef.current();
  });

  useEventListener(playerA, 'playToEnd', () => {
    if (activeRef.current === 'a' && !crossfadingRef.current) startCrossfadeRef.current();
  });
  useEventListener(playerB, 'playToEnd', () => {
    if (activeRef.current === 'b' && !crossfadingRef.current) startCrossfadeRef.current();
  });

  useEventListener(playerA, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') markReady('a');
  });
  useEventListener(playerB, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') markReady('b');
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedVideoView
        style={[StyleSheet.absoluteFill, videoStyle, { opacity: opacityA }]}
        player={playerA}
        contentFit={resizeMode}
        surfaceType="textureView"
        {...videoViewProps}
      />
      <AnimatedVideoView
        style={[StyleSheet.absoluteFill, videoStyle, { opacity: opacityB }]}
        player={playerB}
        contentFit={resizeMode}
        surfaceType="textureView"
        {...videoViewProps}
      />
    </View>
  );
};

/* ---------- Native (expo-video) ---------- */
const BgVideoNative: React.FC<NativeProps & { crossfadeLoop?: boolean }> = ({
  loop = true,
  crossfadeLoop,
  ...rest
}) => {
  const useCrossfade = loop && (crossfadeLoop ?? true);
  if (useCrossfade) return <BgVideoNativeCrossfade {...rest} />;
  return <BgVideoNativeSimple {...rest} loop={loop} />;
};

/* ---------- YouTube (WebView) ---------- */
/** Bundle ID as https origin — required by YouTube embeds (error 153 without Referer). */
const YOUTUBE_EMBED_ORIGIN = 'https://com.workitout.indigo';

const BgVideoYouTube: React.FC<
  Required<Pick<BgVideoProps, 'source'>> &
  Pick<BgVideoProps, 'autoPlay' | 'loop' | 'muted' | 'videoStyle'>
> = ({ source, autoPlay = true, loop = true, muted = true, videoStyle }) => {
  const uri = (source as { uri: string }).uri;

  const youtubeEmbedUrl = useMemo(() => {
    const id = extractYouTubeId(uri);
    if (!id) return null;
    const params = new URLSearchParams({
      autoplay: String(autoPlay ? 1 : 0),
      loop: String(loop ? 1 : 0),
      mute: String(muted ? 1 : 0),
      controls: '0',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      origin: YOUTUBE_EMBED_ORIGIN,
      ...(uri.includes('/shorts/') ? { loop: '1', playlist: id } : {}),
    }).toString();
    return `https://www.youtube.com/embed/${id}?${params}`;
  }, [uri, autoPlay, loop, muted]);

  if (!youtubeEmbedUrl) return null;

  const isShorts = uri.includes('/shorts/');
  const html = `<!doctype html>
    <html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
    <meta name="referrer" content="strict-origin-when-cross-origin"/>
    <style>
      html,body{margin:0;height:100%;overflow:hidden;background:#000}
      .wrap{position:fixed;inset:0;overflow:hidden;background:#000}
      ${isShorts
        ? `/* 9:16 aspect ratio for Shorts - fill and crop like object-fit: cover */
      .frame{
        position:absolute;top:50%;left:50%;
        width:177.78vh;height:100vh;
        min-width:100vw;min-height:56.25vw;
        transform:translate(-50%,-50%);
        border:0;
      }`
        : `/* 16:9 aspect ratio for regular videos - fill and crop like object-fit: cover */
      .frame{
        position:absolute;top:50%;left:50%;
        width:100vw;height:56.25vw;
        min-width:177.78vh;min-height:100vh;
        transform:translate(-50%,-50%);
        border:0;
      }`
      }
    </style>
    </head><body>
      <div class="wrap">
        <iframe class="frame"
          src="${youtubeEmbedUrl}"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowfullscreen></iframe>
      </div>
    </body></html>`;

  return (
    <WebView
      source={{ html, baseUrl: YOUTUBE_EMBED_ORIGIN }}
      style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}
      containerStyle={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      setSupportMultipleWindows={false}
      pointerEvents="none"
    />
  );
};

/* ---------- Vimeo (WebView fallback) ---------- */
const BgVideoVimeoEmbed: React.FC<
  Required<Pick<BgVideoProps, 'source'>> &
  Pick<BgVideoProps, 'autoPlay' | 'loop' | 'muted' | 'vimeoParams' | 'videoStyle'>
> = ({ source, autoPlay = true, loop = true, muted = true, vimeoParams, videoStyle }) => {
  const uri = (source as { uri: string }).uri;

  const vimeoEmbedUrl = useMemo(() => {
    const id = extractVimeoId(uri);
    if (!id) return null;
    const params = new URLSearchParams({
      autoplay: String(vimeoParams?.autoplay ?? (autoPlay ? 1 : 0)),
      loop: String(vimeoParams?.loop ?? (loop ? 1 : 0)),
      background: String(vimeoParams?.background ?? 1),
      muted: String(vimeoParams?.muted ?? (muted ? 1 : 0)),
      controls: String(vimeoParams?.controls ?? 0),
      // Prefer a mobile-friendly cap for backgrounds when embedding.
      quality: String(vimeoParams?.quality ?? '720p'),
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
      .frame{
        position:absolute;top:50%;left:50%;
        width:100vw;height:56.25vw;
        min-width:177.78vh;min-height:100vh;
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

/* ---------- Vimeo (resolve → native, embed fallback) ---------- */
const BgVideoVimeo: React.FC<
  Required<Pick<BgVideoProps, 'source'>> &
  Pick<BgVideoProps, 'autoPlay' | 'loop' | 'muted' | 'resizeMode' | 'vimeoParams' | 'videoStyle' | 'coverImage' | 'crossfadeLoop'>
> = ({
  source,
  autoPlay = true,
  loop = true,
  muted = true,
  resizeMode = 'cover',
  vimeoParams,
  videoStyle,
  coverImage,
  crossfadeLoop,
}) => {
  const uri = (source as { uri: string }).uri;
  const preferredQuality = vimeoParams?.quality ?? '720p';

  const [streamUri, setStreamUri] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'progressive' | 'hls'>('progressive');
  const [useEmbed, setUseEmbed] = useState(false);
  const [posterUri, setPosterUri] = useState<string | undefined>(coverImage);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStreamUri(null);
    setUseEmbed(false);
    setVideoReady(false);

    if (!coverImage) {
      resolveVimeoThumbnail(uri).then((thumb) => {
        if (!cancelled && thumb) setPosterUri(thumb);
      });
    } else {
      setPosterUri(coverImage);
    }

    resolveVimeoStream(uri, preferredQuality)
      .then((stream) => {
        if (cancelled) return;
        setStreamUri(stream.uri);
        setContentType(stream.contentType);
        if (stream.thumbnailUrl && !coverImage) setPosterUri(stream.thumbnailUrl);
      })
      .catch(() => {
        if (!cancelled) setUseEmbed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [uri, preferredQuality, coverImage]);

  if (useEmbed) {
    return (
      <BgVideoVimeoEmbed
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        vimeoParams={vimeoParams}
        videoStyle={videoStyle}
      />
    );
  }

  return (
    <>
      {posterUri && !videoReady ? (
        <ImageBackground
          source={{ uri: posterUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : null}
      {streamUri ? (
        <BgVideoNative
          source={{
            uri: streamUri,
            useCaching: contentType === 'progressive',
            contentType: contentType === 'hls' ? 'hls' : 'auto',
          }}
          loop={loop}
          autoPlay={autoPlay}
          muted={muted}
          resizeMode={resizeMode}
          videoStyle={videoStyle}
          crossfadeLoop={crossfadeLoop}
          onReady={() => setVideoReady(true)}
        />
      ) : null}
    </>
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
  crossfadeLoop,
  vimeoParams,
  coverImage,
}) => {
  const isRemote = typeof source === 'object' && !!(source as { uri?: string })?.uri;
  const uri = isRemote ? (source as { uri: string }).uri : undefined;
  const useYouTube = isRemote && isYouTubeUrl(uri);
  const useVimeo = isRemote && isVimeoUrl(uri);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
        {coverImage && !useVimeo ? (
          <ImageBackground
            source={{ uri: coverImage }}
            style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
            resizeMode="cover"
          />
        ) : null}
      </View>
      {useYouTube ? (
        <BgVideoYouTube
          source={source as { uri: string }}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          videoStyle={videoStyle}
        />
      ) : useVimeo ? (
        <BgVideoVimeo
          source={source as { uri: string }}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          resizeMode={resizeMode}
          vimeoParams={vimeoParams}
          videoStyle={videoStyle}
          coverImage={coverImage}
          crossfadeLoop={crossfadeLoop}
        />
      ) : (
        <BgVideoNative
          source={source}
          loop={loop}
          autoPlay={autoPlay}
          muted={muted}
          resizeMode={resizeMode}
          videoStyle={videoStyle}
          crossfadeLoop={crossfadeLoop}
        />
      )}

      {overlayStyle ? <View style={[StyleSheet.absoluteFill, overlayStyle]} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});

export default memo(BgVideo);
