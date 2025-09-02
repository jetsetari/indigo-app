// src/components/Form/Radio.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './RadioStyle';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** Explanation tooltip text */
  info?: string;
};

export default function FormRadio({
  label,
  options,
  value,
  onChange,
  required = false,
  info,
}: Props) {
  return (
    <View style={{ marginBottom: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: 'red' }}> *</Text>}
        </Text>
        {info && (
          <TouchableOpacity
            onPress={() => Alert.alert(label, info)}
            style={{ marginLeft: 6, marginBottom: 5 }}
          >
            <Feather name="info" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.radioGroup}>
        {options.map((option) => {
          const selected = option.value === value;
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
    </View>
  );
}
