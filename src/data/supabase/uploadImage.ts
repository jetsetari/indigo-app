// src/data/supabase/uploadImage.ts
import { getSupabase } from './connection';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { decode as base64ToArrayBuffer } from 'base64-arraybuffer';

type Args = {
  uri: string;
  filepath: string;
  filename: string;
  bucket?: string;
  contentType?: string;
  makePublic?: boolean;
};

export async function uploadImage({
  uri,
  filepath,
  filename,
  bucket = 'files',
  contentType,
  makePublic = true,
}: Args): Promise<string | null> {
  const supabase = getSupabase();

  const resolved = await resolveLocalFileUri(uri);

  const extFromUri = getExt(resolved) || 'jpg';
  const extFromName = getExt(filename);
  const ext = extFromName || extFromUri;
  const finalContentType = contentType || guessContentType(ext);

  const safeName = ensureExt(sanitize(filename), ext);
  const safePath = joinPath(sanitize(filepath), safeName);

  // --- read bytes (blob → arrayBuffer OR base64 fallback) ---
  const arrayBuffer = await readAsArrayBuffer(resolved);

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(safePath, arrayBuffer, {
      contentType: finalContentType,
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadErr) {
    console.warn('uploadImage upload error:', uploadErr);
    return null;
  }

  if (makePublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(safePath);
    return data.publicUrl ?? null;
  } else {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(safePath, 60 * 60);
    if (error) return null;
    return data.signedUrl ?? null;
  }
}

/* ------------------------------- helpers -------------------------------- */

async function readAsArrayBuffer(localUri: string): Promise<ArrayBuffer> {
  // Try fetch → blob → arrayBuffer first
  try {
    const res = await fetch(localUri);
    // @ts-ignore - RN Blob sometimes lacks arrayBuffer; guard below
    const blob: Blob = await res.blob();
    // @ts-ignore
    if (typeof blob.arrayBuffer === 'function') {
      // @ts-ignore
      return await blob.arrayBuffer();
    }
    // fall through to base64 path if not available
  } catch {
    // fall through
  }

  // Fallback: read file as base64 and convert to ArrayBuffer
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToArrayBuffer(base64);
}

async function resolveLocalFileUri(uri: string): Promise<string> {
  if (uri.startsWith('ph://')) {
    const assetId = uri.replace('ph://', '');
    try {
      const info = await MediaLibrary.getAssetInfoAsync(assetId);
      if (info.localUri) return info.localUri; // file://…
      if (info.uri) return info.uri;
    } catch {}
  }
  return uri;
}

function getExt(path: string): string | null {
  const m = path.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : null;
}

function guessContentType(ext?: string | null) {
  switch ((ext || '').toLowerCase()) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png':  return 'image/png';
    case 'webp': return 'image/webp';
    case 'heic':
    case 'heif': return 'image/heic';
    default:     return 'application/octet-stream';
  }
}

function ensureExt(name: string, ext: string) {
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}
function sanitize(seg: string) {
  return seg.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '').replace(/\/+/g, '/').replace(/\s+/g, '_');
}
function joinPath(a: string, b: string) {
  return `${sanitize(a)}/${sanitize(b)}`.replace(/^\/+/, '');
}
