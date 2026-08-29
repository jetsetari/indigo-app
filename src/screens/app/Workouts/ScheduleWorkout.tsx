// src/screens/app/Workouts/ScheduleWorkout.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, Alert, PanResponder, Animated, TouchableOpacity, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Feather } from '@expo/vector-icons';

import StickyHeader from '~/components/Layout/StickyHeader';
import WhiteRefreshControl from '~/components/Layout/WhiteRefreshControl';
import IconButton from '~/components/Buttons/IconButton';
import CustomButton from '~/components/Buttons/CustomButton';
import AssignWorkoutSheet from '~/components/Blocks/AssignWorkoutSheet';
import Loading from '~/components/Loading';
import __base from '~/assets/styles/base';
import { formatDisplayDate, formatDisplayDateLong, formatWeekRange } from '~/data/helpers/date';
import { useUserStore } from '~/data/store/userStore';
import {
  fetchWorkoutsByDateRange,
  fetchSelectableWeekWorkouts,
  fetchUpcomingWorkouts,
  moveWorkoutToDate,
  skipWorkoutDay,
  updateWorkoutDayDate,
  type SelectableWeekWorkout,
} from '~/data/supabase/workoutsHandler';

type WorkoutDayItem = {
  id: number;
  date: string;
  title: string | null;
  coverImage: string | null;
  dayName: string;
  dateFormatted: string;
};

type RowRect = { y: number; height: number };

function buildWeekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = dayjs(weekStart).add(i, 'day');
    return {
      iso: date.format('YYYY-MM-DD'),
      dayName: date.format('dddd'),
      dateFormatted: formatDisplayDate(date.format('YYYY-MM-DD')),
    };
  });
}

function hitIndex(pageY: number, rects: (RowRect | null)[]): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r) continue;
    if (pageY >= r.y && pageY <= r.y + r.height) return i;
    const dist = Math.abs(pageY - (r.y + r.height / 2));
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

export default function ScheduleWorkout() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const client = useUserStore((s) => s.client);
  const selectedDate = route.params?.isoDate || dayjs().format('YYYY-MM-DD');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutDayItem[]>([]);
  const [selectableWorkouts, setSelectableWorkouts] = useState<SelectableWeekWorkout[]>([]);
  const [busyDayId, setBusyDayId] = useState<number | null>(null);
  const [assignDate, setAssignDate] = useState<string | null>(null);
  const weekStart = dayjs(selectedDate).startOf('week').add(1, 'day').format('YYYY-MM-DD');
  const didAutoOpen = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dragTop = useRef(new Animated.Value(0)).current;

  const rowRefs = useRef<(View | null)[]>([]);
  const rowRects = useRef<(RowRect | null)[]>([]);
  const grabOffset = useRef(0);
  const workoutsRef = useRef(workouts);
  workoutsRef.current = workouts;
  const draggingRef = useRef<number | null>(null);
  const movingRef = useRef(false);

  const loadWorkouts = useCallback(async (opts?: { refresh?: boolean }) => {
    if (!client?.id) return;
    if (opts?.refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const days = buildWeekDays(weekStart);
      const fromDate = weekStart;
      const toDate = dayjs(weekStart).add(6, 'day').format('YYYY-MM-DD');
      const [fetchedWorkouts, selectable, upcoming] = await Promise.all([
        fetchWorkoutsByDateRange(client.id, fromDate, toDate),
        fetchSelectableWeekWorkouts(client.id, dayjs().format('YYYY-MM-DD'), 20),
        fetchUpcomingWorkouts(client.id, dayjs().format('YYYY-MM-DD'), 10).catch(() => []),
      ]);
      const byId = new Map<number, SelectableWeekWorkout>();
      for (const workout of [...selectable, ...upcoming]) byId.set(workout.id, workout);
      setSelectableWorkouts(Array.from(byId.values()));

      const workoutsByDate = new Map<string, WorkoutDayItem>();
      fetchedWorkouts.forEach((w) => {
        workoutsByDate.set(w.date, {
          id: w.id,
          date: w.date,
          title: w.title,
          coverImage: w.coverImage ?? null,
          dayName: dayjs(w.date).format('dddd'),
          dateFormatted: formatDisplayDate(w.date),
        });
      });

      const weekWorkouts: WorkoutDayItem[] = days.map((day) => {
        const existing = workoutsByDate.get(day.iso);
        if (existing) return existing;
        return {
          id: 0,
          date: day.iso,
          title: null,
          coverImage: null,
          dayName: day.dayName,
          dateFormatted: day.dateFormatted,
        };
      });

      setWorkouts(weekWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [client?.id, weekStart]);

  useEffect(() => {
    if (!client?.id) return;
    loadWorkouts();
  }, [client?.id, weekStart, loadWorkouts]);

  useEffect(() => {
    if (loading || didAutoOpen.current || !workouts.length) return;
    const day = workouts.find((item) => item.date === selectedDate);
    if (day && day.id === 0) {
      didAutoOpen.current = true;
      setAssignDate(selectedDate);
    }
  }, [loading, workouts, selectedDate]);

  const onRefresh = useCallback(() => {
    loadWorkouts({ refresh: true });
  }, [loadWorkouts]);

  const measureRows = () => {
    rowRefs.current.forEach((ref, i) => {
      ref?.measureInWindow((_x, y, _w, h) => {
        rowRects.current[i] = { y, height: h };
      });
    });
  };

  const handleSelectWorkout = (workout: SelectableWeekWorkout) => {
    if (!client?.id || !assignDate || busyDayId) return;
    const title = workout.title?.trim() || `Day ${workout.dayIndex}`;
    const targetWorkout = workouts.find((item) => item.id > 0 && item.date === assignDate);

    Alert.alert(
      'Add this workout?',
      `Move "${title}" to ${formatDisplayDateLong(assignDate)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select',
          onPress: async () => {
            setBusyDayId(workout.id);
            try {
              await moveWorkoutToDate(
                client.id,
                workout.id,
                workout.date,
                assignDate,
                targetWorkout?.id
              );
              setAssignDate(null);
              await loadWorkouts();
            } catch (error) {
              console.error('Error selecting workout:', error);
              Alert.alert('Could not add workout', 'Please try again.');
            } finally {
              setBusyDayId(null);
            }
          },
        },
      ]
    );
  };

  const handleSkipMissedWorkout = (workout: SelectableWeekWorkout) => {
    if (busyDayId) return;
    const title = workout.title?.trim() || `Day ${workout.dayIndex}`;

    Alert.alert(
      'Skip this workout?',
      `"${title}" will be marked as skipped and will not be offered again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            setBusyDayId(workout.id);
            try {
              await skipWorkoutDay(workout.id);
              await loadWorkouts();
            } catch (error) {
              console.error('Error skipping workout:', error);
              Alert.alert('Could not skip workout', 'Please try again.');
            } finally {
              setBusyDayId(null);
            }
          },
        },
      ]
    );
  };

  const handleMoveWorkout = useCallback(async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || movingRef.current) return;
    const current = workoutsRef.current;
    const fromItem = current[fromIndex];
    const toItem = current[toIndex];
    if (!fromItem || fromItem.id <= 0) return;

    const targetDates = Array.from({ length: 7 }, (_, i) =>
      dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD')
    );
    const targetDate = targetDates[toIndex];
    const fromTargetDate = targetDates[fromIndex];
    const next = [...current];

    movingRef.current = true;
    try {
      if (toItem.id > 0) {
        await Promise.all([
          updateWorkoutDayDate(fromItem.id, targetDate),
          updateWorkoutDayDate(toItem.id, fromTargetDate),
        ]);
        next[fromIndex] = {
          ...toItem,
          date: fromTargetDate,
          dateFormatted: formatDisplayDate(fromTargetDate),
          dayName: dayjs(fromTargetDate).format('dddd'),
        };
        next[toIndex] = {
          ...fromItem,
          date: targetDate,
          dateFormatted: formatDisplayDate(targetDate),
          dayName: dayjs(targetDate).format('dddd'),
        };
      } else {
        await updateWorkoutDayDate(fromItem.id, targetDate);
        next[toIndex] = {
          ...fromItem,
          date: targetDate,
          dateFormatted: formatDisplayDate(targetDate),
          dayName: dayjs(targetDate).format('dddd'),
        };
        next[fromIndex] = {
          id: 0,
          date: fromTargetDate,
          title: null,
          coverImage: null,
          dayName: dayjs(fromTargetDate).format('dddd'),
          dateFormatted: formatDisplayDate(fromTargetDate),
        };
      }
      setWorkouts(next);
    } catch (error) {
      console.error('Error moving workout:', error);
      loadWorkouts();
    } finally {
      movingRef.current = false;
    }
  }, [weekStart, loadWorkouts]);

  const startDrag = (index: number, g: PanResponderGestureState) => {
    measureRows();
    const rect = rowRects.current[index];
    grabOffset.current = rect ? g.y0 - rect.y : 40;
    draggingRef.current = index;
    setDraggingIndex(index);
    setHoverIndex(index);
    dragTop.setValue(g.y0 - grabOffset.current);
  };

  const updateDrag = (g: PanResponderGestureState) => {
    dragTop.setValue(g.moveY - grabOffset.current);
    setHoverIndex(hitIndex(g.moveY, rowRects.current));
  };

  const endDrag = async (g: PanResponderGestureState) => {
    const from = draggingRef.current;
    const to = hitIndex(g.moveY, rowRects.current);
    draggingRef.current = null;
    setDraggingIndex(null);
    setHoverIndex(null);
    if (from == null || from === to) return;
    await handleMoveWorkout(from, to);
  };

  const startDragRef = useRef(startDrag);
  const updateDragRef = useRef(updateDrag);
  const endDragRef = useRef(endDrag);
  startDragRef.current = startDrag;
  updateDragRef.current = updateDrag;
  endDragRef.current = endDrag;

  const panHandlers = useRef(
    Array.from({ length: 7 }, (_, index) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_e: GestureResponderEvent, g) => startDragRef.current(index, g),
        onPanResponderMove: (_e, g) => updateDragRef.current(g),
        onPanResponderRelease: (_e, g) => { endDragRef.current(g); },
        onPanResponderTerminate: (_e, g) => { endDragRef.current(g); },
      }).panHandlers
    )
  ).current;

  const renderDayInner = (item: WorkoutDayItem, showHandle: boolean) => {
    const hasWorkout = item.id > 0;
    const displayTitle = item.title && item.title.trim() ? item.title : item.dayName;

    return (
      <View style={styles.dayCardContent}>
        {hasWorkout && item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.dayImage} />
        ) : (
          <View style={[styles.dayImage, styles.dayImagePlaceholder]}>
            <View style={styles.placeholderDots} />
          </View>
        )}

        <View style={styles.dayInfo}>
          <Text style={styles.dayName}>{item.dayName}</Text>
          <Text style={[styles.dayTitle, !hasWorkout && styles.addLabel]}>
            {hasWorkout ? displayTitle : 'No Workout'}
          </Text>
        </View>

        <View style={styles.dayMeta}>
          <Text style={styles.dayDate}>{item.dateFormatted}</Text>
          {showHandle && hasWorkout && (
            <View style={styles.dragHandle}>
              <Feather name="menu" size={20} color="#FFF" />
            </View>
          )}
        </View>
      </View>
    );
  };

  const weekLabel = formatWeekRange(weekStart);
  const draggingItem = draggingIndex != null ? workouts[draggingIndex] : null;

  const header = (
    <View style={[__base.paddingHorizontal, styles.headerWrap]}>
      <View style={styles.headerRow}>
        <IconButton onPress={() => navigation.goBack()} icon="chevron-back" />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Schedule workout</Text>
          <Text style={styles.headerSubtitle}>{weekLabel}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <StickyHeader title="Schedule workout" noSticky padded={false}>
        {header}
        <Loading />
      </StickyHeader>
    );
  }

  return (
    <>
      <StickyHeader
        title="Schedule workout"
        noSticky
        padded={false}
        scrollEnabled={draggingIndex == null}
        refreshing={refreshing}
        refreshControl={
          <WhiteRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {header}

        <View style={[__base.paddingHorizontal, { paddingBottom: 100 }]}>
          <View style={styles.weekSection}>
            <Text style={styles.sectionHeading}>This week</Text>
            <Text style={styles.sectionHint}>
              Drag a workout to another day, or add one to an empty day.
            </Text>
            <View style={styles.workoutsContainer}>
              {workouts.map((item, index) => {
                const hasWorkout = item.id > 0;
                const isSource = draggingIndex === index;
                const isTarget = hoverIndex === index && draggingIndex != null && draggingIndex !== index;

                const card = (
                  <View
                    ref={(node) => { rowRefs.current[index] = node; }}
                    collapsable={false}
                    onLayout={measureRows}
                    style={[
                      styles.dayCard,
                      !hasWorkout && styles.dayCardEmpty,
                      isSource && styles.dayCardDragging,
                      isTarget && styles.dayCardDropTarget,
                    ]}
                  >
                    <View style={styles.dayCardContent}>
                      {hasWorkout && item.coverImage ? (
                        <Image source={{ uri: item.coverImage }} style={styles.dayImage} />
                      ) : (
                        <View style={[styles.dayImage, styles.dayImagePlaceholder]}>
                          {hasWorkout ? <View style={styles.placeholderDots} /> : <Feather name="plus" size={18} color="#FFF" />}
                        </View>
                      )}

                      <View style={styles.dayInfo}>
                        <Text style={styles.dayName}>{item.dayName}</Text>
                        <Text style={[styles.dayTitle, !hasWorkout && styles.addLabel]}>
                          {hasWorkout ? (item.title?.trim() || item.dayName) : 'Add workout'}
                        </Text>
                      </View>

                      <View style={styles.dayMeta}>
                        <Text style={styles.dayDate}>{item.dateFormatted}</Text>
                        {hasWorkout && (
                          <View style={styles.dragHandle} {...panHandlers[index]}>
                            <Feather name="menu" size={20} color="#FFF" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );

                if (!hasWorkout) {
                  return (
                    <TouchableOpacity
                      key={item.date}
                      activeOpacity={0.8}
                      onPress={() => setAssignDate(item.date)}
                    >
                      {card}
                    </TouchableOpacity>
                  );
                }

                return <View key={item.date}>{card}</View>;
              })}
            </View>
          </View>

          <CustomButton
            title="Done"
            backgroundColor="#000"
            textColor="#FFF"
            borderColor="#FFF"
            onPress={() => navigation.goBack()}
          />
        </View>
      </StickyHeader>

      <AssignWorkoutSheet
        visible={assignDate != null}
        targetDate={assignDate}
        workouts={selectableWorkouts}
        busyId={busyDayId}
        onClose={() => setAssignDate(null)}
        onSelect={handleSelectWorkout}
        onSkip={handleSkipMissedWorkout}
      />

      {draggingItem && (
        <View pointerEvents="none" style={styles.dragOverlay}>
          <Animated.View style={[styles.dayCard, styles.dragGhost, { top: dragTop }]}>
            {renderDayInner(draggingItem, true)}
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingTop: 62,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFF',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#999',
  },
  weekSection: {
    gap: 8,
    marginBottom: 20,
  },
  sectionHeading: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sectionHint: {
    color: '#999',
    fontSize: 13,
    marginBottom: 4,
  },
  dayCard: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 0,
    marginBottom: 5,
    overflow: 'hidden',
  },
  dayCardDragging: {
    opacity: 0.35,
  },
  dayCardEmpty: {
    borderStyle: 'dashed',
    borderColor: '#444',
  },
  dayCardDropTarget: {
    borderColor: '#4DD4AC',
    borderStyle: 'dashed',
  },
  workoutsContainer: {
    marginBottom: 5,
  },
  dayCardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  dayImage: {
    width: 60,
    height: 60,
    borderRadius: 0,
    marginRight: 12,
  },
  dayImagePlaceholder: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderDots: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 2,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addLabel: {
    color: '#888',
    fontWeight: '600',
  },
  dayMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  dayDate: {
    fontSize: 12,
    color: '#999',
  },
  dragHandle: {
    padding: 8,
    margin: -4,
  },
  dragOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
  },
  dragGhost: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderColor: '#4DD4AC',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
