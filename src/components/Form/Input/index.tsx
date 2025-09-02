// src/components/Form/Input.tsx

import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { styles } from './InputStyle';

type Props = {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  placeholder?: string;
  showStrengthBar?: boolean;
  /** If you pass this, an ℹ️ will appear next to the label */
  info?: string;
};

export default function FormInput({
  label,
  onChange,
  required = false,
  type = 'text',
  value,
  placeholder,
  showStrengthBar = true,
  info,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const secure = isPassword && !showPassword;
  const passwordStrength = getPasswordStrength(value);

  const onInfoPress = () => {
    if (info) Alert.alert(label, info);
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: 'red' }}> *</Text>}
        </Text>
        {info && (
          <TouchableOpacity onPress={onInfoPress} style={{ marginLeft: 6, marginBottom: 5 }}>
            <Ionicons name="information-circle-outline" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.input, focused && styles.inputFocused]}>
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={(text) => {
            if (type === 'number') {
              onChange(text.replace(/[^0-9]/g, ''));
            } else {
              onChange(text);
            }
          }}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          placeholder={placeholder || label}
          placeholderTextColor="#AAA"
          keyboardType={
            type === 'email'
              ? 'email-address'
              : type === 'number'
              ? 'numeric'
              : 'default'
          }
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
          >
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={'#FFF'} />
            {/*<Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#FFF"
            />*/}
          </TouchableOpacity>
        )}
      </View>

      {isPassword && showStrengthBar && value.length > 0 && (
        <View style={styles.strengthWrapper}>
          <View
            style={[
              styles.strengthBar,
              passwordStrength === 'weak' && styles.weak,
              passwordStrength === 'medium' && styles.medium,
              passwordStrength === 'strong' && styles.strong,
            ]}
          />
          <Text style={styles.strengthLabel}>{passwordStrength}</Text>
        </View>
      )}
    </View>
  );
}

function getPasswordStrength(pw: string): 'weak' | 'medium' | 'strong' {
  if (pw.length < 6) return 'weak';
  if (pw.match(/[A-Z]/) && pw.match(/[0-9]/) && pw.length >= 8)
    return 'strong';
  return 'medium';
}
