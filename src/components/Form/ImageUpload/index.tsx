import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, Image, ActivityIndicator, StyleSheet, Platform, ActionSheetIOS, Alert
} from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { Feather } from '@expo/vector-icons';
import { uploadImage } from '~/data/supabase/uploadImage';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import __base from '~/assets/styles/base';
import { styles } from './ImageUploadStyle';

type Variant = 'button' | 'avatar' | 'square';
import { runImageValidators, type ImageRule } from '../validation';

export type FormImageUploadProps<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;
  filepath: string;                 // Supabase storage path prefix, e.g. 'users'
  filename?: string;                // optional fixed filename; otherwise uuid
  label?: string | null | false;    // small caption under image
  rules?: ImageRule[];                       // RHF rules (e.g., { required: 'Image required' })

  variant?: Variant;                // 'button' | 'avatar' | 'square'
  size?: number;                    // avatar/square size (px)
  buttonLabel?: string;             // for variant='button'
  disabled?: boolean;
  style?: any;                      // wrapper style
  showRemove?: boolean;             // show small remove button when has image
  source?: 'both' | 'camera' | 'library'; // how to pick image
};

export default function FormImageUpload<T extends FieldValues = FieldValues>({
  control,
  name,
  filepath,
  filename,
  label = null,
  rules,
  variant = 'avatar',
  size = 100,
  buttonLabel = 'Upload image',
  disabled,
  style,
  showRemove = true,
  source = 'both',
}: FormImageUploadProps<T>) {
  const [uploading, setUploading] = useState(false);

  const shapeStyle = useMemo(() => {
    if (variant === 'avatar') return { width: size, height: size, borderRadius: size / 2 };
    if (variant === 'square') return { width: size, height: size, borderRadius: 0 };
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

  async function launch(kind: 'camera' | 'library', onChange: (url: string | null) => void) {
    if (!(await ensurePermissions(kind))) return;

    const hasNewAPI = 'MediaType' in ImagePicker;
    const mediaTypes = hasNewAPI
      ? [ (ImagePicker as any).MediaType.Images ]
      : (ImagePicker as any).MediaTypeOptions.Images;

    const result =
      kind === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: mediaTypes as any, quality: 1 });

    if (!result.canceled && result.assets?.length) {
      await doUpload(result.assets[0].uri, onChange);
    }
  }

  function selectSource(onChange: (url: string | null) => void) {
    if (source === 'camera') return launch('camera', onChange);
    if (source === 'library') return launch('library', onChange);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Camera', 'Photo Library'], cancelButtonIndex: 0 },
        (i) => {
          if (i === 1) launch('camera', onChange);
          if (i === 2) launch('library', onChange);
        }
      );
    } else {
      Alert.alert('Select image', undefined, [
        { text: 'Camera', onPress: () => launch('camera', onChange) },
        { text: 'Gallery', onPress: () => launch('library', onChange) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  async function doUpload(uri: string, onChange: (url: string | null) => void) {
    try {
      setUploading(true);
      const uploadName = filename || String(uuid.v4());
      const url = await uploadImage({ uri, filepath, filename: uploadName });
      if (url) {
        toastSuccess('Image uploaded', 'Your photo has been saved successfully.');
        onChange(url);
      } else {
        toastError('Upload failed', 'Please try again');
      }
    } catch (e: any) {
      toastError('Upload failed', e?.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  function clear(onChange: (url: string | null) => void) {
    onChange(null);
  }

  return (
    <Controller
      // @ts-expect-error: keep loose to avoid leaking generics everywhere
      control={control}
      name={name}
      rules={{
        validate: (v: unknown) => {
          const url = (v == null ? null : String(v)) as string | null;
          const res = runImageValidators(url, rules, /*required*/ !!(rules?.some(r => r.type === 'required')));
          return res === true ? true : res;
        },
      }}
      render={({ field: { value = null, onChange }, fieldState: { error } }) => {
        if (variant === 'button') {
          return (
            <>
              <Pressable
                style={[styles.btn, disabled && styles.disabled, style]}
                onPress={() => selectSource(onChange)}
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
              {!!error?.message && <Text style={[__base.errorMsg, { marginTop: 4 }]}>{String(error.message)}</Text>}
            </>
          );
        }

        return (
          <View style={[style, styles.columnWrap]}>
            {value && showRemove && (
              <Pressable onPress={() => clear(onChange)} style={styles.remove}>
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
              onPress={() => selectSource(onChange)}
              disabled={disabled}
            >
              {uploading ? (
                <ActivityIndicator />
              ) : value ? (
                <Image source={{ uri: value as string }} style={[StyleSheet.absoluteFill, shapeStyle]} />
              ) : (
                <Feather name="camera" size={22} color="#888" />
              )}
            </Pressable>

            {!!label && <Text style={styles.caption}>{label}</Text>}
            {!!error?.message && <Text style={[__base.errorMsg, { marginTop: 4 }]}>{String(error.message)}</Text>}
          </View>
        );
      }}
    />
  );
}
