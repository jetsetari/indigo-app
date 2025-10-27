import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  cover?: string | null;
  title: string;
  subtitle?: string;
  label?: string; // e.g., "1A"
  borderColor?: string;
  backgroundColor?: string;
};

export default function ExerciseItemXs({
  cover,
  title,
  subtitle,
  label,
  borderColor = '#FFF',
  backgroundColor = '#000',
}: Props) {
  return (
    <View style={[styles.card, { borderColor, backgroundColor }]}>
      {cover ? <Image source={{ uri: cover }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbEmpty]} />}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {/*!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>*/}
      </View>
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 0, padding: 5, paddingRight: 15,
    flexDirection: 'row', alignItems: 'center',
  },
  thumb: { width: 30, height: 30, borderRadius: 0, backgroundColor: '#222', borderColor: '#FFF', borderWidth: 1 },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 10, minWidth: 0 },
  title: { color: '#fff', fontSize: 14, fontWeight: '400' },
  subtitle: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  label: { color: '#e2e8f0', fontWeight: '800', marginLeft: 8 },
});
