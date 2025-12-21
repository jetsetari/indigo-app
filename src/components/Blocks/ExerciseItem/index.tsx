import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  cover?: string | null;
  title: string;
  subtitle?: string;
  label?: string;              // e.g., "1A"
  borderColor?: string;
  backgroundColor?: string;

  // --- New, all optional (won't break old code) ---
  selected?: boolean;          // highlight when selected
  done?: boolean;              // show green check when showCheck=true
  showCheck?: boolean;         // opt-in to render a check UI
  onPress?: () => void;        // make the card tappable
  setsProgress?: string;       // e.g., "2/3" to show sets progress
};

export default function ExerciseItem({
  cover,
  title,
  subtitle,
  label,
  borderColor = '#333',
  backgroundColor = '#111',
  selected,
  done,
  showCheck,
  onPress,
  setsProgress,
}: Props) {
  const Wrapper: any = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.card,
        //{ borderColor, backgroundColor },
        { borderColor, backgroundColor: '#000000' },
        selected && styles.selected,
      ]}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]} />
      )}

      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.selectedColor]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, selected && styles.selectedColor]} numberOfLines={1}>{subtitle}</Text>}
        {setsProgress && (
          <Text style={[styles.setsProgress, selected && styles.selectedColor]}>{setsProgress} sets</Text>
        )}
      </View>

      {!!label && <Text style={[styles.label, selected && styles.selectedColor]}>{label}</Text>}

      {showCheck && (
        <View style={[styles.checkWrap, done && styles.checkWrapChecked]}>
          <Feather
            name={done ? 'check' : 'square'}
            size={22}
            color={done ? '#FFF' : '#CCC'}
          />
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1, borderRadius: 0, padding: 5, paddingRight: 15,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  selected: { borderColor: '#fff', backgroundColor: '#000' },
  thumb: { width: 54, height: 54, borderRadius: 0, backgroundColor: '#222', borderColor: '#FFF', borderWidth: 1 },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700' },
  selectedColor: {  },
  subtitle: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  setsProgress: { color: '#999', fontSize: 11, marginTop: 2 },
  label: { color: '#e2e8f0', fontWeight: '800' },
  checkWrap: { marginLeft: 8, backgroundColor: '#CCC' },
  checkWrapChecked: { marginLeft: 8, backgroundColor: '#22c55e' },
});
