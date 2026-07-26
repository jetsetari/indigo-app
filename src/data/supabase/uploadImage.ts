// src/data/supabase/uploadImage.ts
import { supabase } from './connection';
import { File } from 'expo-file-system';
import { resizeToBoundingBox } from '../helpers/imageResizer';

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
  const { uri: scaledUri } = await resizeToBoundingBox(uri, 1200, 0.82);
  const resolved = await resolveLocalFileUri(scaledUri);

  const extFromUri = getExt(resolved) || 'jpg';
  const extFromName = getExt(filename);
  const ext = extFromName || extFromUri;
  const finalContentType = contentType || guessContentType(ext);

  const safeName = ensureExt(sanitize(filename), ext);
  const safePath = joinPath(sanitize(filepath), safeName);

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
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(safePath, 60 * 60);
  if (error) return null;
  return data.signedUrl ?? null;
}

/* ------------------------------- helpers -------------------------------- */

async function readAsArrayBuffer(localUri: string): Promise<ArrayBuffer> {
  try {
    const file = new File(localUri);
    return await file.arrayBuffer();
  } catch {
    // fall through to fetch
  }

  try {
    const res = await fetch(localUri);
    const blob = await res.blob();
    if (typeof blob.arrayBuffer === 'function') {
      return await blob.arrayBuffer();
    }
  } catch {
    // fall through
  }

  throw new Error('Unable to read image bytes for upload');
}

async function resolveLocalFileUri(uri: string): Promise<string> {
  if (!uri.startsWith('ph://')) return uri;

  // Lazy-load so Expo Go doesn't warn about media-library on every ImageUpload mount.
  try {
    const MediaLibrary = await import('expo-media-library');
    const assetId = uri.replace('ph://', '');
    const info = await MediaLibrary.getAssetInfoAsync(assetId);
    if (info.localUri) return info.localUri;
    if (info.uri) return info.uri;
  } catch {
    // keep original uri
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
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    default:
      return 'application/octet-stream';
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
