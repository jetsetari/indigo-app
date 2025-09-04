import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import Checkbox from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  label: string;
  onPressLink?: () => void;
};
import __base from '~/assets/styles/base';

export default function RHFCheckbox<T extends FieldValues>({
  control, name, label, onPressLink,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value = false, onChange }, fieldState: { error } }) => (
        <>
          <Checkbox value={!!value} onChange={onChange} label={label} onPressLink={onPressLink} />
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
