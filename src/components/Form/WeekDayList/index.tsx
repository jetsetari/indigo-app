import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  selected: string[];
  onChange: (days: string[]) => void;
};

const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export default function WeekDayList({ selected, onChange }: Props) {
  const toggleDay = (day: string) => {
    if (selected.includes(day)) {
      onChange(selected.filter(d => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Training days</Text>
      <View style={styles.days}>
        {days.map((day) => {
          const isSelected = selected.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
              onPress={() => toggleDay(day)}
            >
              {isSelected && <Feather name="check" size={18} color="#000" />}
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      { (selected.length > 4) && <Text style={styles.warning}>We recommend starting off with four days with a new program</Text> }
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 40
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  warning: {
    fontSize: 14,
    marginTop: 30,
    fontFamily: 'Inter-Light',
    color: '#FFCC00',
    marginBottom: -20
  },
  days: {
    flexDirection: 'row',
    gap: 10,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayBoxSelected: {
    backgroundColor: '#FFF',
  },
  dayText: {
    position: 'absolute',
    bottom: -16,
    fontSize: 11,
    color: '#FFF',
    fontFamily: 'Inter-Light',
    textAlign: 'center',
    width: '100%',
  },
});
