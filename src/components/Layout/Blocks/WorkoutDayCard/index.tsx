import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from './WorkoutDayCardStyle';

type Props = {
  day: string;
  focus: string;
  completed?: boolean;
  onPress?: () => void;
};

export default function WorkoutDayCard({ day, focus, completed = false, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.focus}>{focus}</Text>
      </View>
      <View style={styles.right}>
        {completed ? (
          <Feather name="check" size={22} color="#4CAF50" />
        ) : (
          <Feather name="chevron-right" size={22} color="#888" />
        )}
      </View>
    </TouchableOpacity>
  );
}
