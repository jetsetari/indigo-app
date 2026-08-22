// src/components/Form/FormInput.tsx
import React, { useMemo, useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Controller, type FieldValues, type Path } from 'react-hook-form';

// Styles (keep using your existing ones)
import { styles } from './InputStyle';
import __base from '~/assets/styles/base';

// Validation helpers
import { runValidators, type Rule } from '../validation';

export type InputType = 'text' | 'email' | 'password' | 'number';

export type FormInputProps<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: InputType;
  required?: boolean;
  info?: string;                    // ℹ️ next to label
  rules?: Rule[];                   // optional client-side validations
  showStrengthBar?: boolean;        // kept for parity; not rendered here
};

export default function FormInput<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  required,
  info,
  rules = [],
}: FormInputProps<T>) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const isPassword = type === 'password';
  const secure = isPassword && !showPassword;
  const isNumber = type === 'number';

  const onInfoPress = () => {
    if (info) Alert.alert(label, info);
  };

  return (
    <Controller
      // @ts-expect-error: control typed loosely on purpose
      control={control}
      name={name}
      rules={{
        validate: (v: unknown) => {
          const str = v == null ? '' : String(v);
          const res = runValidators(str, rules, type, !!required);
          return res === true ? true : res;
        },
      }}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const stringValue = (value ?? '').toString();
        const errorMsg = useMemo(() => {
          if (!touched) return '';
          const res = runValidators(stringValue, rules, type, !!required);
          return res === true ? '' : res;
        }, [stringValue, rules, type, required, touched]);

        return (
          <View style={__base.inputWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={__base.label}>
                {label}
                {required && <Text style={__base.asterix}> *</Text>}
              </Text>
              {info && (
                <TouchableOpacity onPress={onInfoPress} style={__base.info}>
                  <Feather name="info" size={18} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.input, focused && styles.inputFocused]}>
              <TextInput
                style={[__base.inputField, styles.inputField]}
                value={stringValue}
                onChangeText={(text) => {
                  if (isNumber) {
                    // Keep decimals (e.g. bodyfat); empty stays '' so optional fields can be blank
                    const cleaned = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    onChange(cleaned === '' ? '' : cleaned);
                  } else {
                    onChange(text);
                  }
                }}
                autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                placeholder={placeholder || label}
                placeholderTextColor="#AAA"
                keyboardType={
                  type === 'email' ? 'email-address' : isNumber ? 'numeric' : 'default'
                }
                secureTextEntry={secure}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  setTouched(true);
                }}
              />

              {isPassword && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={"#FFF"} />
                </TouchableOpacity>
              )}
            </View>

            {!!(errorMsg || error?.message) && (
              <Text style={[__base.errorMsg, { marginTop: 4 }]}>
                {String(errorMsg || error?.message)}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
