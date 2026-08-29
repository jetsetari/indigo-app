import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export function workoutPreviewLine(names: string[] = [], total?: number): string {
  if (!names.length) return '';
  const shown = names.slice(0, 3);
  const extra = (total ?? names.length) - shown.length;
  return extra > 0 ? `${shown.join(' · ')} +${extra}` : shown.join(' · ');
}

type Props = {
  dateLabel: string;
  title: string;
  preview?: string;
  isMissed?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onSkip?: () => void;
};

export default function WorkoutPickCard({
  dateLabel,
  title,
  preview,
  busy = false,
  disabled = false,
  onSelect,
  onSkip,
}: Props) {
  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.title}>{title}</Text>
          {!!preview && (
            <Text style={styles.preview} numberOfLines={2}>
              {preview}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          {busy ? (
            <ActivityIndicator color="#4DD4AC" />
          ) : (
            <>
              <TouchableOpacity style={styles.select} onPress={onSelect} disabled={disabled}>
                <Text style={styles.selectText}>Select</Text>
              </TouchableOpacity>
              {onSkip && (
                <TouchableOpacity style={styles.skip} onPress={onSkip} disabled={disabled}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  date: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    color: '#4DD4AC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    color: '#777',
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 8,
    minWidth: 88,
  },
  skip: {
    borderColor: '#333',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 15,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  select: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectText: {
    color: '#000',
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
