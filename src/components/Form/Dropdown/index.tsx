import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import { Feather } from '@expo/vector-icons';

import { styles } from './DropdownStyle';
import __base from '~/assets/styles/base';
import { runSelectValidators, type SelectRule } from '../validation';

type OptionIn = { label: string; value: string | number };

export type FormDropdownProps<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;
  label?: string;
  required?: boolean;               // visual + validator flag
  options: OptionIn[];
  parseAsNumber?: boolean;          // convert selected value back to number in form state
  placeholder?: string;             // fallback: 'Select an option...'
  rules?: SelectRule[];             // shared validator rules (required for now)
  noMargin?: boolean;
};

export default function FormDropdown<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  required = false,
  options,
  parseAsNumber = false,
  placeholder = 'Select an option...',
  rules = [],
  noMargin = false,
}: FormDropdownProps<T>) {
  const [focused, setFocused] = useState(false);
  const pickerRef = useRef<any>(null);
  const skipInitialChange = useRef(true);

  // normalize to string for RNPickerSelect (mirrors your current base component)
  const normalized = options.map(o => ({ label: o.label, value: String(o.value) }));
  const [touched, setTouched] = useState(false);
  const openPicker = () => pickerRef.current?.togglePicker?.();

  return (
    <Controller
      // @ts-expect-error loosen control typing
      control={control}
      name={name}
      rules={{
        validate: (v: unknown) => {
          const res = runSelectValidators(v as any, rules, required);
          return res === true ? true : res;
        },
      }}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const displayValue =
          typeof value === 'number' ? String(value) : ((value as any) ?? '');

        const handleChange = (v: string) => {
          // RNPickerSelect fires an empty value on mount / reset, which would wipe saved selections.
          if (skipInitialChange.current) {
            skipInitialChange.current = false;
            if (v === '' || v == null) return;
          }
          if ((v === '' || v == null) && !touched && value) return;
          const next = parseAsNumber ? (v === '' ? (undefined as any) : Number(v)) : v;
          onChange(next as any);
        };

        // compute message eagerly so blur/focus updates error instantly
        const errorMsg = useMemo(() => {
          if (!touched) return '';
          const res = runSelectValidators(value as any, rules, required);
          return res === true ? '' : (res as string);
        }, [value, rules, required, touched]);

        return (
          <View style={{ marginBottom: (noMargin ? 0 : 15) }}>
            {!!label && (
              <Text style={__base.label}>
                {label}
                {required && <Text style={__base.asterix}> *</Text>}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => { openPicker(); setTouched(true) }}
              style={[styles.input, focused && styles.inputFocused]}
            >
              <View pointerEvents="none">
                <RNPickerSelect
                  ref={pickerRef}
                  onValueChange={handleChange}
                  items={normalized}
                  value={displayValue}
                  useNativeAndroidPickerStyle={false}
                  onOpen={() => setFocused(true)}
                  onClose={() => setFocused(false)}
                  style={{
                    inputIOS: styles.selectText,
                    inputAndroid: styles.selectText,
                    iconContainer: styles.icon,
                  }}
                  Icon={() => <Feather name="chevrons-down" size={20} color="#FFF" />}
                  placeholder={{ label: placeholder, value: '' }}
                />
              </View>
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
