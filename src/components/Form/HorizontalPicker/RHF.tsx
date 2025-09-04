import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import HorizontalPicker from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  label?: string;
  min?: number;
  max?: number;
  unit?: string;
};

import __base from '~/assets/styles/base';

export default function RHFHorizontalPicker<T extends FieldValues>({
  control, name, label, min, max, unit,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <HorizontalPicker
            label={label}
            min={min}
            max={max}
            unit={unit}
            value={typeof value === 'number' ? (value as number) : 0}
            onChange={onChange}
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
