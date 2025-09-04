import React from 'react';
import { Text } from 'react-native';
import { Controller, type FieldValues } from 'react-hook-form';
import ImageUpload from './index';
import type { ControlOf } from '~/data/types/rhf';
import __base from '~/assets/styles/base';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: any;
  label?: string | null | false;    // label under the image
  filepath: string;
  filename?: string;
  variant?: 'button' | 'avatar' | 'square';
  size?: number;
  buttonLabel?: string;
  disabled?: boolean;
  source?: 'both' | 'camera' | 'library';
  style?: any;
};

export default function RHFImageUpload<T extends FieldValues>({
  control, name, label, ...rest
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value = null, onChange }, fieldState: { error } }) => (
        <>
          <ImageUpload value={value as string | null} onChange={onChange} label={label} {...rest} />
          {!!error?.message && (
            <Text style={__base.errorMsg}>
              {String(error.message)}
            </Text>
          )}
        </>
      )}
    />
  );
}
