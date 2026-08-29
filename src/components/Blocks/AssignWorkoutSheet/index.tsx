import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import IconButton from '~/components/Buttons/IconButton';
import WorkoutPickCard, { workoutPreviewLine } from '~/components/Blocks/WorkoutPickCard';
import type { SelectableWeekWorkout } from '~/data/supabase/workoutsHandler';
import { formatDisplayDateLong, formatDisplayDateWeekday } from '~/data/helpers/date';

type Props = {
  visible: boolean;
  targetDate: string | null;
  workouts: SelectableWeekWorkout[];
  busyId: number | null;
  onClose: () => void;
  onSelect: (workout: SelectableWeekWorkout) => void;
  onSkip: (workout: SelectableWeekWorkout) => void;
};

function laterDateLabel(workout: SelectableWeekWorkout): string {
  if (!workout.date) return 'Unscheduled';
  const date = dayjs(workout.date);
  const weekEnd = dayjs().startOf('week').add(7, 'day');
  return date.isAfter(weekEnd, 'day') ? formatDisplayDateWeekday(workout.date) : date.format('dddd');
}

export default function AssignWorkoutSheet({
  visible,
  targetDate,
  workouts,
  busyId,
  onClose,
  onSelect,
  onSkip,
}: Props) {
  const missed = workouts.filter((w) => w.isMissed && w.date !== targetDate);
  const later = workouts.filter((w) => !w.isMissed && w.date !== targetDate);
  const dayLabel = targetDate ? formatDisplayDateLong(targetDate) : '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Add workout</Text>
              {!!dayLabel && <Text style={styles.subtitle}>For {dayLabel}</Text>}
            </View>
            <IconButton onPress={onClose} icon="close" />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {missed.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.heading}>Missed</Text>
                {missed.map((workout) => (
                  <WorkoutPickCard
                    key={workout.id}
                    dateLabel={formatDisplayDateLong(workout.date)}
                    title={workout.title?.trim() || `Day ${workout.dayIndex}`}
                    preview={workoutPreviewLine(workout.previewExercises, workout.items?.length)}
                    isMissed
                    busy={busyId === workout.id}
                    disabled={busyId !== null}
                    onSelect={() => onSelect(workout)}
                    onSkip={() => onSkip(workout)}
                  />
                ))}
              </View>
            )}

            {later.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.heading}>This week & upcoming</Text>
                {later.map((workout) => (
                  <WorkoutPickCard
                    key={workout.id}
                    dateLabel={laterDateLabel(workout)}
                    title={workout.title?.trim() || `Day ${workout.dayIndex}`}
                    preview={workoutPreviewLine(workout.previewExercises, workout.items?.length)}
                    busy={busyId === workout.id}
                    disabled={busyId !== null}
                    onSelect={() => onSelect(workout)}
                  />
                ))}
              </View>
            )}

            {missed.length === 0 && later.length === 0 && (
              <Text style={styles.empty}>
                No workouts to assign. Drag one here from another day.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderColor: '#333',
    maxHeight: '82%',
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    color: '#999',
    fontSize: 13,
    marginTop: 2,
  },
  scroll: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
    gap: 8,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  heading: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  empty: {
    color: '#888',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 20,
  },
});
