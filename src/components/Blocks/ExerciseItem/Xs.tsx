import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  cover?: string | null;
  title: string;
  subtitle?: string;
  label?: string; // e.g., "1A"
  borderColor?: string;
  backgroundColor?: string;
  /** Completed sets count */
  loggedSets?: number;
  /** Total sets for this exercise / supersets group */
  totalSets?: number;
  /** Fill color for completed set squares (supersets accent) */
  progressColor?: string;
};

export default function ExerciseItemXs({
  cover,
  title,
  subtitle,
  label,
  borderColor = '#FFF',
  backgroundColor = '#000',
  loggedSets = 0,
  totalSets = 0,
  progressColor = '#4DD4AC',
}: Props) {
  const doneCount = Math.max(0, Math.min(loggedSets, totalSets));
  const showSquares = totalSets > 0;

  return (
    <View style={[styles.card, { borderColor, backgroundColor: '#000000' }]}>
      {cover ? <Image source={{ uri: cover }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbEmpty]} />}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {showSquares && (
          <View style={styles.squares}>
            {Array.from({ length: totalSets }, (_, i) => {
              const filled = i < doneCount;
              return (
                <View
                  key={i}
                  style={[
                    styles.square,
                    {
                      backgroundColor: filled ? progressColor : '#2A2A2A',
                      borderColor: filled ? progressColor : '#444',
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 0, padding: 5, paddingRight: 15,
    flexDirection: 'row', alignItems: 'center',
    flex: 1,
  },
  thumb: { width: 30, height: 30, borderRadius: 0, backgroundColor: '#222', borderColor: '#FFF', borderWidth: 1 },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 10, minWidth: 0 },
  title: { color: '#fff', fontSize: 14, fontWeight: '400' },
  subtitle: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  squares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 4,
  },
  square: {
    width: 8,
    height: 8,
    borderRadius: 0,
    borderWidth: 1,
  },
  label: { color: '#e2e8f0', fontWeight: '800', marginLeft: 8 },
});
