import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, Image, ActivityIndicator, StyleSheet, Platform, ActionSheetIOS, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { Feather } from '@expo/vector-icons';
import { uploadImage } from '~/data/supabase/uploadImage';
import { toastError, toastSuccess } from '~/data/helpers/toast';

type Variant = 'button' | 'avatar' | 'square';

type Props = {
  filepath: string;                // Supabase storage path prefix, e.g. 'users'
  filename?: string;               // optional fixed filename; otherwise uuid
  value?: string | null;           // controlled: uploaded URL (or preview)
  onChange?: (url: string | null) => void;

  variant?: Variant;               // 'button' | 'avatar' | 'square'
  size?: number;                   // avatar/square size (px)
  buttonLabel?: string;            // for variant='button'
  disabled?: boolean;
  style?: any;                     // wrapper style
  showRemove?: boolean;            // show small remove button when has image
  source?: 'both' | 'camera' | 'library'; // how to pick image

  /** NEW: small label under the image (e.g., "Front", "Side", "Back"). */
  label?: string | null | false;
};

export default function ImageUpload({
  filepath,
  filename,
  value,
  onChange,
  variant = 'avatar',
  size = 100,
  buttonLabel = 'Upload image',
  disabled,
  style,
  showRemove = true,
  source = 'both',
  label = null,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const shapeStyle = useMemo(() => {
    if (variant === 'avatar') return { width: size, height: size, borderRadius: size / 2 };
    if (variant === 'square') return { width: size, height: size, borderRadius: 0 };
    // 'button' → not used
    return {};
  }, [variant, size]);

  async function ensurePermissions(kind: 'camera' | 'library') {
    const res =
      kind === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) {
      toastError('Permission denied', 'Please enable permissions in settings.');
      return false;
    }
    return true;
  }

  async function launch(kind: 'camera' | 'library') {
    if (!(await ensurePermissions(kind))) return;

    // Prefer new API (MediaType) and fall back silently if older SDK
    const hasNewAPI = 'MediaType' in ImagePicker;
    const mediaTypes = hasNewAPI
      ? [ (ImagePicker as any).MediaType.Images ]   // new: array of MediaType
      : (ImagePicker as any).MediaTypeOptions.Images; // old enum

    const result =
      kind === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaTypes as any,
            quality: 1,
          });

    if (!result.canceled && result.assets?.length) {
      await doUpload(result.assets[0].uri);
    }
  }

  function selectSource() {
    if (source === 'camera') return launch('camera');
    if (source === 'library') return launch('library');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Camera', 'Photo Library'], cancelButtonIndex: 0 },
        (i) => {
          if (i === 1) launch('camera');
          if (i === 2) launch('library');
        }
      );
    } else {
      Alert.alert('Select image', undefined, [
        { text: 'Camera', onPress: () => launch('camera') },
        { text: 'Gallery', onPress: () => launch('library') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  async function doUpload(uri: string) {
    try {
      setUploading(true);
      const uploadName = filename || String(uuid.v4());
      const url = await uploadImage({ uri, filepath, filename: uploadName });
      if (url) {
        toastSuccess('Image uploaded', 'Your photo has been saved successfully.');
        onChange?.(url);
      } else {
        toastError('Upload failed', 'Please try again');
      }
    } catch (e: any) {
      toastError('Upload failed', e?.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    onChange?.(null);
  }

  if (variant === 'button') {
    return (
      <Pressable
        style={[styles.btn, disabled && styles.disabled, style]}
        onPress={selectSource}
        disabled={disabled}
      >
        {uploading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Feather name="upload-cloud" size={18} color="#fff" />
            <Text style={styles.btnText}>{buttonLabel}</Text>
          </>
        )}
      </Pressable>
    );
  }

  // avatar / square with label underneath
  return (
    <View style={[style, styles.columnWrap]}>
      {value && showRemove && (
        <Pressable onPress={clear} style={styles.remove}>
          <Feather name="trash-2" size={16} color="#FFF" />
        </Pressable>
      )}
      <Pressable
        style={[
          styles.box,
          shapeStyle,
          disabled && styles.disabled,
          !value && styles.placeholder,
        ]}
        onPress={selectSource}
        disabled={disabled}
      >
        {uploading ? (
          <ActivityIndicator />
        ) : value ? (
          <Image source={{ uri: value }} style={[StyleSheet.absoluteFill, shapeStyle]} />
        ) : (
          <Feather name="camera" size={22} color="#888" />
        )}
      </Pressable>

      {!!label && <Text style={styles.caption}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  box: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: '#181818',
    borderStyle: 'dashed',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter-Medium' },
  disabled: { opacity: 0.5 },
  remove: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  caption: {
    marginTop: 6,
    color: '#BDBDBD',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
