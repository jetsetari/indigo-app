import React from 'react';
import { Text } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import WeekDayList from './index';
import type { ControlOf } from '~/data/types/rhf';
import __base from '~/assets/styles/base';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
};

export default function RHFWeekDayList<T extends FieldValues>({ control, name }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        return (
          <>
            <WeekDayList selected={selected} onChange={onChange} />
            {!!error?.message && <Text style={__base.errorMsg}>{String(error.message)}</Text>}
          </>
        );
      }}
    />
  );
}
