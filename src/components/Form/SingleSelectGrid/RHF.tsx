import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import SingleSelectGrid from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  options: { label: string; description: string; icon: string; value: string }[];
};
import __base from '~/assets/styles/base';

export default function RHFSingleSelectGrid<T extends FieldValues>({
  control, name, options,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <SingleSelectGrid
            options={options}
            selected={(value as string) ?? ''}
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
