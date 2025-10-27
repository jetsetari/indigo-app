// src/components/Form/FormToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import __base from '~/assets/styles/base';
import { styles } from './ToggleStyle';

type Option = string | { label: string; value: string };

export type FormToggleProps<T extends FieldValues = FieldValues> = {
  control: unknown;               // RHF Control<any>
  name: Path<T>;
  options: Option[];              // ['low','med','high'] OR [{label,value}]
  label?: string;
  required?: boolean;             // visual only (asterisk); use rules for validation
  rules?: any;                    // RHF rules, e.g. { required: 'Pick one' }
};

export default function FormToggle<T extends FieldValues>({
  control, name, options, label, required, rules,
}: FormToggleProps<T>) {
  // normalize options to {label,value}
  const opts = React.useMemo(
    () => options.map(o => (typeof o === 'string' ? { label: o, value: o } : o)),
    [options]
  );

  return (
    <Controller
      // @ts-expect-error: keep control generic-loose
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={{ marginBottom: 15 }}>
          {!!label && (
            <Text style={__base.label}>
              {label}
              {required && <Text style={__base.asterix}> *</Text>}
            </Text>
          )}

          <View style={styles.wrapper}>
            {opts.map((o) => {
              const selected = value === o.value || (!value && o === opts[0]);
              return (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.option, selected && styles.selectedOption]}
                  onPress={() => onChange(o.value)}
                >
                  <Text style={[styles.optionText, selected && styles.selectedText]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!error?.message && <Text style={[__base.errorMsg, { marginTop: 4 }]}>{String(error.message)}</Text>}
        </View>
      )}
    />
  );
}
