import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import FormDatePicker from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  label: string;
  required?: boolean;  // visual asterisk only
};

import __base from '~/assets/styles/base';

export default function RHFDatePicker<T extends FieldValues>({
  control, name, label, required,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <FormDatePicker
            label={label}
            value={(value as Date) ?? null}
            onChange={onChange}
            required={!!required}
          />
          {!!error?.message && (
            <Text style={__base.errorMsg}>
              {error.message as string}
            </Text>
          )}
        </>
      )}
    />
  );
}
