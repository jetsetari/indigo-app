import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './SearchStyle';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export default function Search({ value, onChange, placeholder = 'Typ om te beginnen zoeken…' }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.searchWrapper, focused && styles.focused]}>
      <Feather name="search" size={20} color="#888" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#888"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Feather name="x-circle" size={20} color="#888" style={styles.clearIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}
