import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { styles } from './RadioStyle';
import __base from '~/assets/styles/base';

type Option = { label: string; value: string };

export type FormRadioProps<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;
  label: string;
  options: Option[];
  required?: boolean;               // visual asterisk; enforce via rules if needed
  info?: string;                    // tooltip/explainer
  rules?: any;                      // RHF rules, e.g. { required: 'Pick one' }
};

export default function FormRadio<T extends FieldValues>({
  control,
  name,
  label,
  options,
  required = false,
  info,
  rules,
}: FormRadioProps<T>) {
  return (
    <Controller
      // @ts-expect-error keep control generic-loose to avoid leaking generics
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={{ marginBottom: 15 }}>
          {/* Label + info */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.label}>
              {label}
              {required && <Text style={{ color: 'red' }}> *</Text>}
            </Text>
            {info && (
              <TouchableOpacity
                onPress={() => Alert.alert(label, info)}
                style={{ marginLeft: 6, marginBottom: 5 }}
                activeOpacity={0.8}
              >
                <Feather name="info" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Options */}
          <View style={styles.radioGroup}>
            {options.map((option) => {
              const selected = option.value === (value as string);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => onChange(option.value)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterActive,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!error?.message && (
            <Text style={[__base.errorMsg, { marginTop: 4 }]}>
              {String(error.message)}
            </Text>
          )}
        </View>
      )}
    />
  );
}
