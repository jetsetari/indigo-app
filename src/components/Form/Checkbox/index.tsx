// components/Form/Checkbox.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './CheckboxStyle';

type Props = {
  value: boolean;
  onChange: (newValue: boolean) => void;
  label: string;
  onPressLink?: () => void;
};

export default function Checkbox({ value, onChange, label, onPressLink }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onChange(!value)}>
      <View style={[styles.checkbox, value && styles.checked]}>
        {value && <Feather name="check" size={16} color="#000" />}
      </View>
      <Text style={styles.label}>
        I agree with{' '}
        <Text style={styles.link} onPress={onPressLink}>
          Terms and Privacy Policy
        </Text>
      </Text>
    </TouchableOpacity>
  );
}

