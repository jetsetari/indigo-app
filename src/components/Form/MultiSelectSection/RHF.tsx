import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import MultiSelectSection from './';
import type { ControlOf } from '~/data/types/rhf';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  title: string;
  icon?: string;
  options: { label: string; slug: string }[];
};

import __base from '~/assets/styles/base';

export default function RHFMultiSelectSection<T extends FieldValues>({
  control, name, title, icon, options,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const selected = (Array.isArray(value) ? value : []) as string[];
        return (
          <>
            <MultiSelectSection
              title={title}
              icon={icon}
              options={options}
              selected={selected}
              onChange={onChange}
            />
            {!!error?.message && (
              <Text style={__base.errorMsg}>
                {String(error.message)}
              </Text>
            )}
          </>
        );
      }}
    />
  );
}
