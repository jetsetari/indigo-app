import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  findNodeHandle,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Feather } from '@expo/vector-icons';
import { styles } from './DropdownStyle';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  required?: boolean;
  onChange: (value: string) => void;
  value: string;
  options: Option[];
};

export default function Dropdown({
  label,
  required = false,
  onChange,
  value,
  options,
}: Props) {
  const [focused, setFocused] = useState(false);
  const pickerRef = useRef<any>('');

  const openPicker = () => {
    if (pickerRef.current) {
      pickerRef.current.togglePicker();
    }
  };

  return (
    <View style={{ marginBottom: 15 }}>
      { label && <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: 'red' }}> *</Text>}
      </Text> }

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openPicker}
        style={[styles.input, focused && styles.inputFocused]}
      >
        <View pointerEvents="none">
          <RNPickerSelect
            ref={pickerRef}
            onValueChange={onChange}
            items={options}
            value={value}
            useNativeAndroidPickerStyle={false}
            onOpen={() => setFocused(true)}
            onClose={() => setFocused(false)}
            style={{
              inputIOS: styles.selectText,
              inputAndroid: styles.selectText,
              iconContainer: styles.icon,
            }}
            Icon={() => (
              <Feather name="chevrons-down" size={20} color="#FFF" />
            )}
            placeholder={{ label: 'Select an option...', value: '' }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
