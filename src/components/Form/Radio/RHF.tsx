import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import FormRadio from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  label: string;
  options: { label: string; value: string }[];
  required?: boolean;
  info?: string;
};

import __base from '~/assets/styles/base';

export default function RHFRadio<T extends FieldValues>({
  control, name, label, options, required, info,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <FormRadio
            label={label}
            options={options}
            value={(value as string) ?? ''}
            onChange={onChange}
            required={!!required}
            info={info}
          />
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
