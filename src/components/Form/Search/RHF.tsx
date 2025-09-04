import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import Search from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  placeholder?: string;
};

import __base from '~/assets/styles/base';

export default function RHFSearch<T extends FieldValues>({
  control, name, placeholder,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <Search
            value={(value as string) ?? ''}
            onChange={onChange}
            placeholder={placeholder}
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
