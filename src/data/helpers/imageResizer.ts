import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

type ResizeResult = { uri: string; width: number; height: number; mime: 'image/jpeg' | 'image/png' };

function getSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err)
    );
  });
}

/**
 * Downscale an image so the longest edge <= maxEdge.
 * Converts to JPEG by default (smaller files), with quality/compress control.
 */
export async function resizeToBoundingBox(
  uri: string,
  maxEdge = 1200,
  compress = 0.82,                      // 0..1 (lower = smaller)
  format: ImageManipulator.SaveFormat = ImageManipulator.SaveFormat.JPEG
): Promise<ResizeResult> {
  const { width, height } = await getSize(uri).catch(() => ({ width: maxEdge, height: maxEdge }));
  const longest = Math.max(width, height);

  // no need to resize
  if (!longest || longest <= maxEdge) {
    return { uri, width, height, mime: format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/jpeg' };
  }

  const scale = maxEdge / longest;
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetW, height: targetH } }],
    { compress, format } // JPEG by default
  );

  return {
    uri: result.uri,
    width: targetW,
    height: targetH,
    mime: format === ImageManipulator.SaveFormat.PNG ? 'image/png' : 'image/jpeg',
  };
}
