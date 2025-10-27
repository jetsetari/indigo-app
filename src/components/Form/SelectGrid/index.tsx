import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import __base from '~/assets/styles/base';
import { styles } from './SelectGridStyle';

type Option = {
  label: string;
  description: string;
  icon: string;
  value: string;
};

export type FormSelectGridProps<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;
  options: Option[];
  label?: string;                   // optional title above the grid
  required?: boolean;               // visual asterisk; use rules to actually enforce
  rules?: any;                      // RHF rules (e.g., { required: 'Pick one' })
};

export default function FormSelectGrid<T extends FieldValues>({
  control,
  name,
  options,
  label,
  required,
  rules,
}: FormSelectGridProps<T>) {
  return (
    <Controller
      // @ts-expect-error keep control generic-loose
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={{ marginBottom: 20 }}>
          {!!label && (
            <Text style={__base.label}>
              {label}
              {required && <Text style={__base.asterix}> *</Text>}
            </Text>
          )}

          <View style={styles.grid}>
            {options.map((opt) => {
              const isSelected = (value as string) === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => onChange(opt.value)}
                >
                  <View style={styles.iconRow}>
                    <Text style={styles.icon}>{opt.icon}</Text>
                    {isSelected && <Feather name="check" size={16} color="#000" />}
                  </View>
                  <Text style={styles.label}>{opt.label}</Text>
                  <Text style={styles.desc}>{opt.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!error?.message && (
            <Text style={[__base.errorMsg, { marginTop: 6 }]}>{String(error.message)}</Text>
          )}
        </View>
      )}
    />
  );
}
