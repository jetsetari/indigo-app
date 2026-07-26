export type VimeoQuality =
  | 'auto'
  | '4k'
  | '2k'
  | '1080p'
  | '720p'
  | '540p'
  | '360p';

export type VimeoStreamResult = {
  uri: string;
  contentType: 'progressive' | 'hls';
  thumbnailUrl?: string;
};

type ProgressiveFile = {
  url: string;
  width?: number;
  height?: number;
  quality?: string;
};

const QUALITY_HEIGHT: Record<Exclude<VimeoQuality, 'auto'>, number> = {
  '360p': 360,
  '540p': 540,
  '720p': 720,
  '1080p': 1080,
  '2k': 1440,
  '4k': 2160,
};

const cache = new Map<string, VimeoStreamResult>();
const inflight = new Map<string, Promise<VimeoStreamResult>>();

export const extractVimeoId = (url: string): string | null =>
  (url.match(/vimeo\.com\/(?:video\/)?(\d+)/) ||
    url.match(/player\.vimeo\.com\/video\/(\d+)/))?.[1] ?? null;

const longEdge = (file: ProgressiveFile) =>
  Math.max(file.width ?? 0, file.height ?? 0);

const pickProgressive = (
  files: ProgressiveFile[],
  preferred: VimeoQuality = '720p',
): ProgressiveFile | null => {
  if (!files.length) return null;

  const ranked = [...files].sort((a, b) => longEdge(b) - longEdge(a));
  if (preferred === 'auto') return ranked[0];

  const max = QUALITY_HEIGHT[preferred] ?? 720;
  const under = ranked.filter((f) => longEdge(f) > 0 && longEdge(f) <= max);
  if (under.length) return under[0];

  // Prefer the smallest available stream when all are above the cap.
  return ranked[ranked.length - 1];
};

const parseConfig = (
  config: any,
  preferred: VimeoQuality,
): VimeoStreamResult | null => {
  const progressive = (config?.request?.files?.progressive ?? []) as ProgressiveFile[];
  const picked = pickProgressive(progressive, preferred);
  if (picked?.url) {
    return {
      uri: picked.url,
      contentType: 'progressive',
      thumbnailUrl:
        config?.video?.thumbs?.base ??
        config?.video?.thumbs?.['640'] ??
        config?.video?.thumbs?.['960'] ??
        undefined,
    };
  }

  const hls = config?.request?.files?.hls;
  const defaultCdn = hls?.default_cdn;
  const hlsUrl = (defaultCdn && hls?.cdns?.[defaultCdn]?.url) || undefined;
  if (hlsUrl) {
    return {
      uri: hlsUrl,
      contentType: 'hls',
      thumbnailUrl:
        config?.video?.thumbs?.base ??
        config?.video?.thumbs?.['640'] ??
        undefined,
    };
  }

  return null;
};

async function fetchThumbnail(vimeoUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}&width=720`,
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolve a Vimeo page/embed URL to a direct progressive MP4 (preferred) or HLS
 * stream so expo-video can play it natively.
 */
export async function resolveVimeoStream(
  vimeoUrl: string,
  preferredQuality: VimeoQuality = '720p',
): Promise<VimeoStreamResult> {
  const id = extractVimeoId(vimeoUrl);
  if (!id) throw new Error('Invalid Vimeo URL');

  const cacheKey = `${id}:${preferredQuality}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const task = (async () => {
    const res = await fetch(`https://player.vimeo.com/video/${id}/config`, {
      headers: {
        Accept: 'application/json',
        Referer: `https://vimeo.com/${id}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Vimeo config HTTP ${res.status}`);
    }

    const config = await res.json();
    const parsed = parseConfig(config, preferredQuality);
    if (!parsed) throw new Error('No playable Vimeo stream found');

    if (!parsed.thumbnailUrl) {
      parsed.thumbnailUrl = await fetchThumbnail(`https://vimeo.com/${id}`);
    }

    cache.set(cacheKey, parsed);
    return parsed;
  })();

  inflight.set(cacheKey, task);
  try {
    return await task;
  } finally {
    inflight.delete(cacheKey);
  }
}

export async function resolveVimeoThumbnail(vimeoUrl: string): Promise<string | undefined> {
  const id = extractVimeoId(vimeoUrl);
  if (!id) return undefined;
  return fetchThumbnail(`https://vimeo.com/${id}`);
}
