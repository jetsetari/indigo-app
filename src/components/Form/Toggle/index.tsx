import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ToggleStyle';

type Props = {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
};

export default function Toggle({ options, selected, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[styles.option, isSelected && styles.selectedOption]}
            activeOpacity={0.9}
          >
            <Text style={[styles.optionText, isSelected && styles.selectedText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}