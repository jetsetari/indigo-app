// src/components/Form/Dropdown/RHF.tsx
import React from 'react';
import { Text } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import type { ControlOf } from '~/data/types/rhf';
import Dropdown from './index';

// Accept string or number INCOMING, but normalize to string for the base component
type OptionIn = { label: string; value: string | number };

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  label?: string;
  required?: boolean; // visual
  options: OptionIn[];
  parseAsNumber?: boolean; // convert selected value back to number for the form
};

import __base from '~/assets/styles/base';

export default function RHFDropdown<T extends FieldValues>({
  control, name, label, required, options, parseAsNumber = false,
}: Props<T>) {
  // normalize options to string values for the base Dropdown
  const dropdownOptions = options.map((o) => ({ label: o.label, value: String(o.value) }));

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const displayValue =
          typeof value === 'number' ? String(value) : ((value as any) ?? '');

        const handleChange = (v: string) => {
          const next = parseAsNumber ? (v === '' ? (undefined as any) : Number(v)) : v;
          onChange(next as any);
        };

        return (
          <>
            <Dropdown
              label={label}
              required={!!required}
              value={displayValue}
              onChange={handleChange}
              options={dropdownOptions}
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
