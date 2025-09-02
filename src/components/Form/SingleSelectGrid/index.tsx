// components/Form/SingleSelectGrid.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Option = {
  label: string;
  description: string;
  icon: string;
  value: string;
};

type Props = {
  options: Option[];
  selected: string;
  onChange: (value: string) => void;
};

export default function SingleSelectGrid({ options, selected, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onChange(opt.value)}
          >
            <View style={styles.iconRow}>
              <Text style={styles.icon}>{opt.icon}</Text>
              {isSelected && <Feather name="check" size={16} color="#000" />}
            </View>
            <Text style={styles.label}>{opt.label}</Text>
            <Text style={styles.desc}>{opt.description}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#444',
    padding: 15,
    borderRadius: 0,
  },
  cardSelected: {
    backgroundColor: '#000',
    borderColor: '#FFF',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFF',
  },
  desc: {
    fontSize: 12,
    fontFamily: 'Inter-Light',
    color: '#AAA',
    marginTop: 2,
  },
});
