// src/components/Form/Input/RHF.tsx
import React from 'react';
import { Text } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import type { ControlOf } from '~/data/types/rhf';
import FormInput from './index';

type Props<T extends FieldValues> = {
  control: ControlOf<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  showStrengthBar?: boolean;
};

import __base from '~/assets/styles/base';

export default function RHFInput<T extends FieldValues>({
  control, name, label, placeholder, type = 'text', required, showStrengthBar = false,
}: Props<T>) {
  const isNumber = type === 'number';

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const handleChange = (v: unknown) => {
          if (isNumber) {
            const next =
              v === '' || v == null ? (undefined as unknown) : Number(v as any);
            onChange(next);
          } else {
            onChange(v);
          }
        };

        return (
          <>
            <FormInput
              value={
                type === 'number'
                  ? (value ?? '').toString()          // number/null -> string for TextInput
                  : (value ?? '')
              }
              onChange={(txt: string) => {
                if (type === 'number') {
                  // empty -> null, else number
                  onChange(txt === '' ? null : Number(txt));
                } else {
                  onChange(txt);
                }
              }}
              type={type}
              label={label}
              placeholder={placeholder}
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
