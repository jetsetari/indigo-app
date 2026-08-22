import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ClientWorkoutLog } from '~/data/supabase/clientWorkoutLogsHandler';
import __base from '~/assets/styles/base';

type Props = {
  setNumber: number;
  log?: ClientWorkoutLog | null;
  showWeight?: boolean;
  selected?: boolean;
  onPress?: () => void;
  /** Highlight as the set currently being logged */
  accent?: boolean;
  placeholderLabel?: string;
};

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.box, accent && styles.boxAccent]}>
      <Text style={[styles.boxLabel, accent && styles.boxLabelAccent]}>{label}</Text>
      <Text style={[styles.boxValue, accent && styles.boxValueAccent]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function repsDisplay(reps: string | null | undefined) {
  const raw = reps?.trim() || '—';
  if (/^\d+\s*s$/i.test(raw)) return raw.replace(/\s/g, '');
  return raw;
}

function repsUnit(reps: string | null | undefined) {
  const raw = reps?.trim() || '';
  if (/^\d+\s*s$/i.test(raw)) return 'sec';
  return 'reps';
}

export default function PastSetRow({
  log,
  setNumber,
  showWeight = true,
  selected = false,
  onPress,
  accent = false,
  placeholderLabel,
}: Props) {
  const content = (
    <>
      <View style={styles.row}>
        <StatBox label="set" value={String(setNumber)} accent={accent} />
        {placeholderLabel ? (
          <View style={[styles.box, styles.boxFlex, accent && styles.boxAccent]}>
            <Text style={[styles.boxLabel, accent && styles.boxLabelAccent]}>status</Text>
            <Text style={[styles.boxValue, accent && styles.boxValueAccent]} numberOfLines={1}>
              {placeholderLabel}
            </Text>
          </View>
        ) : (
          <>
            <StatBox label={repsUnit(log?.reps)} value={repsDisplay(log?.reps)} accent={accent} />
            {showWeight && (
              <StatBox
                label="kg"
                value={log?.weight != null ? String(log.weight) : '—'}
                accent={accent}
              />
            )}
          </>
        )}
      </View>
      {!!onPress && (
        <Feather name="edit-2" size={16} color={accent ? '#4DD4AC' : '#FFF'} style={styles.editIcon} />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.wrap,
          selected && styles.wrapSelected,
          accent && styles.wrapAccent,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#ffffff80',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wrapSelected: {
    borderColor: '#FFF',
    backgroundColor: '#ffffff18',
  },
  wrapAccent: {
    borderColor: '#4DD4AC',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  box: {
    borderWidth: 1,
    borderColor: '#ffffff55',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 52,
    alignItems: 'center',
  },
  boxFlex: {
    flex: 1,
    alignItems: 'flex-start',
  },
  boxAccent: {
    borderColor: '#4DD4AC88',
  },
  boxLabel: {
    ...__base.textLabel,
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 2,
  },
  boxLabelAccent: {
    color: '#4DD4AC',
  },
  boxValue: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  boxValueAccent: {
    color: '#4DD4AC',
  },
  editIcon: {
    marginLeft: 2,
  },
});
