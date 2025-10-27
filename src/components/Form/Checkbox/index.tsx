// src/components/Form/FormCheckbox.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';

import { styles } from './CheckboxStyle';
import __base from '~/assets/styles/base';
import { runBoolValidators, type BoolRule } from '../validation';

export type FormCheckboxProps<T extends FieldValues = FieldValues> = {
  control: unknown;       // RHF Control<any>
  name: Path<T>;
  label: string;          // full label text from translations
  required?: boolean;
  rules?: BoolRule[];     // optional extra rules
  onPressLink?: () => void; // optional link tap handler if your label includes a link
  info?: string;
};

export default function FormCheckbox<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  required,
  rules = [],
  onPressLink,
  info,
}: FormCheckboxProps<T>) {
  const [touched, setTouched] = useState(false);
  return (
    <Controller
      // @ts-expect-error: loosened to avoid global generic churn
      control={control}
      name={name}
      rules={{ validate: (v: unknown) => runBoolValidators(!!v, rules, !!required) }}
      render={({ field: { value = false, onChange }, fieldState: { error } }) => {
        const errorMsg = useMemo(() => {
          if (!touched) return '';
          const res = runBoolValidators(!!value, rules, !!required);
          return res === true ? '' : (res as string);
        }, [value, rules, required, touched]);

        return (
          <View style={__base.inputWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={__base.label}>
                {label}
                {required && <Text style={__base.asterix}> *</Text>}
              </Text>
              {!!info && (
                <TouchableOpacity onPress={() => alert(info)} style={__base.info}>
                  <Feather name="info" size={18} color={'#888'} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.container} onPress={() => { onChange(!value); setTouched(true); }}>
              <View style={[styles.checkbox, value && styles.checked]}>
                {value && <Feather name="check" size={16} color={'#000'} />}
              </View>
              <Text style={__base.text} onPress={onPressLink}>
                {label}
              </Text>
            </TouchableOpacity>

            {!!(errorMsg || error?.message) && (
              <Text style={[__base.errorMsg, { marginTop: 4 }]}>{String(errorMsg || error?.message)}</Text>
            )}
          </View>
        );
      }}
    />
  );
}
