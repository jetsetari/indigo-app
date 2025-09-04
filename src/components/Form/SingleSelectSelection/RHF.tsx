// src/components/Form/SingleSelectSelection/RHF.tsx
import React from 'react';
import { Text } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import SingleSelectSelection from './index';
import type { ControlOf } from '~/data/types/rhf';

// If you export Option from ./index, use: import type { Option } from './index';
type Option = { label: string; slug: string; screen: string; image?: any };

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  title?: string;
  icon?: string;
  options: any; // ✅ screen is required
};

import __base from '~/assets/styles/base';

export default function RHFSingleSelectSelection<T extends FieldValues>({
  control, name, title, icon, options,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <>
          <SingleSelectSelection
            title={title}
            icon={icon}
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
