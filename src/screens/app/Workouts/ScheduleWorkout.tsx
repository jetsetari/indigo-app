// src/screens/app/Workouts/ScheduleWorkout.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Feather } from '@expo/vector-icons';

import StickyHeader from '~/components/Layout/StickyHeader';
import IconButton from '~/components/Buttons/IconButton';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';
import __base from '~/assets/styles/base';
import { useUserStore } from '~/data/store/userStore';
import { fetchWorkoutsByDateRange, updateWorkoutDayDate } from '~/data/supabase/workoutsHandler';

type WorkoutDayItem = {
  id: number;
  date: string;
  title: string | null;
  coverImage: string | null;
  dayName: string;
  dateFormatted: string;
};

export default function ScheduleWorkout() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const client = useUserStore((s) => s.client);
  const selectedDate = route.params?.isoDate || dayjs().format('YYYY-MM-DD');

  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutDayItem[]>([]);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState(() => {
    // Get Monday of the week containing selectedDate
    return dayjs(selectedDate).startOf('week').add(1, 'day').format('YYYY-MM-DD');
  });

  // Generate week days (Monday to Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs(weekStart).add(i, 'day');
    return {
      iso: date.format('YYYY-MM-DD'),
      dayName: date.format('dddd'),
      dateFormatted: date.format('DD-MM-YYYY'),
    };
  });

  useEffect(() => {
    if (!client?.id) return;
    loadWorkouts();
  }, [client?.id, weekStart]);

  const loadWorkouts = async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const fromDate = weekStart;
      const toDate = dayjs(weekStart).add(6, 'day').format('YYYY-MM-DD');
      const fetchedWorkouts = await fetchWorkoutsByDateRange(client.id, fromDate, toDate);

      // Create a map of workouts by date
      const workoutsByDate = new Map<string, WorkoutDayItem>();
      fetchedWorkouts.forEach((w) => {
        workoutsByDate.set(w.date, {
          id: w.id,
          date: w.date,
          title: w.title,
          coverImage: w.coverImage ?? null,
          dayName: dayjs(w.date).format('dddd'),
          dateFormatted: dayjs(w.date).format('DD-MM-YYYY'),
        });
      });

      // Create array with all 7 days, filling in workouts where they exist
      const weekWorkouts: WorkoutDayItem[] = weekDays.map((day) => {
        const existing = workoutsByDate.get(day.iso);
        if (existing) {
          return existing;
        }
        // Return placeholder for days without workouts
        return {
          id: 0, // 0 means no workout
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
    }
  };

  const handleMoveWorkout = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      setSelectedWorkoutIndex(null);
      return;
    }

    const newWorkouts = [...workouts];
    const targetDates = Array.from({ length: 7 }, (_, i) => 
      dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD')
    );

    const fromItem = newWorkouts[fromIndex];
    const toItem = newWorkouts[toIndex];
    const targetDate = targetDates[toIndex];

    // If moving a workout to a slot that has a workout, swap them
    if (fromItem.id > 0 && toItem.id > 0) {
      // Swap: move fromItem to toIndex, move toItem to fromIndex
      const fromTargetDate = targetDates[fromIndex];
      
      // Update both workouts
      try {
        await Promise.all([
          updateWorkoutDayDate(fromItem.id, targetDate),
          updateWorkoutDayDate(toItem.id, fromTargetDate),
        ]);

        // Swap in local state
        [newWorkouts[fromIndex], newWorkouts[toIndex]] = [newWorkouts[toIndex], newWorkouts[fromIndex]];
        newWorkouts[fromIndex].date = fromTargetDate;
        newWorkouts[fromIndex].dateFormatted = dayjs(fromTargetDate).format('DD-MM-YYYY');
        newWorkouts[fromIndex].dayName = dayjs(fromTargetDate).format('dddd');
        newWorkouts[toIndex].date = targetDate;
        newWorkouts[toIndex].dateFormatted = dayjs(targetDate).format('DD-MM-YYYY');
        newWorkouts[toIndex].dayName = dayjs(targetDate).format('dddd');
        
        setWorkouts(newWorkouts);
      } catch (error) {
        console.error('Error swapping workouts:', error);
        loadWorkouts();
      }
    } else if (fromItem.id > 0) {
      // Moving workout to empty slot
      try {
        await updateWorkoutDayDate(fromItem.id, targetDate);
        
        // Move in local state
        newWorkouts[toIndex] = { ...fromItem, date: targetDate, dateFormatted: dayjs(targetDate).format('DD-MM-YYYY'), dayName: dayjs(targetDate).format('dddd') };
        newWorkouts[fromIndex] = {
          id: 0,
          date: targetDates[fromIndex],
          title: null,
          coverImage: null,
          dayName: dayjs(targetDates[fromIndex]).format('dddd'),
          dateFormatted: dayjs(targetDates[fromIndex]).format('DD-MM-YYYY'),
        };
        
        setWorkouts(newWorkouts);
      } catch (error) {
        console.error('Error moving workout:', error);
        loadWorkouts();
      }
    }

    setSelectedWorkoutIndex(null);
  };

  const renderDayCard = (item: WorkoutDayItem, index: number) => {
    const hasWorkout = item.id > 0;
    const displayTitle = item.title && item.title.trim() ? item.title : item.dayName;
    const isSelected = selectedWorkoutIndex === index;

    const handlePress = () => {
      if (selectedWorkoutIndex === null) {
        // Select this workout if it has one
        if (hasWorkout) {
          setSelectedWorkoutIndex(index);
        }
      } else if (selectedWorkoutIndex === index) {
        // Deselect
        setSelectedWorkoutIndex(null);
      } else {
        // Move selected workout to this position
        handleMoveWorkout(selectedWorkoutIndex, index);
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.dayCard,
          isSelected && styles.dayCardSelected,
          !hasWorkout && selectedWorkoutIndex !== null && styles.dayCardDropTarget,
        ]}
      >
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
            <Text style={[styles.dayTitle, !hasWorkout && styles.dayTitleEmpty]}>
              {hasWorkout ? displayTitle : 'No Workout'}
            </Text>
          </View>

          <View style={styles.dayMeta}>
            <Text style={styles.dayDate}>{item.dateFormatted}</Text>
            {hasWorkout && (
              <View style={styles.dragHandle}>
                <Feather name="menu" size={20} color="#FFF" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <>
        <StickyHeader title="Schedule workout" noSticky>
          <View style={[__base.paddingHorizontal, { paddingTop: 70, paddingBottom: 20 }]}>
            <View style={styles.headerRow}>
              <IconButton onPress={() => navigation.goBack()} icon="chevron-back" />
              <Text style={styles.headerTitle}>Schedule workout</Text>
            </View>
          </View>
          <Loading />
        </StickyHeader>
      </>
    );
  }

  return (
    <>
      <StickyHeader title="Schedule workout" noSticky>
        <View style={[__base.paddingHorizontal, { paddingTop: 70, paddingBottom: 20 }]}>
          <View style={styles.headerRow}>
            <IconButton onPress={() => navigation.goBack()} icon="chevron-back" />
            <Text style={styles.headerTitle}>Schedule workout</Text>
          </View>
        </View>

        <View style={[__base.paddingHorizontal, { paddingBottom: 100 }]}>
          {selectedWorkoutIndex !== null && (
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Tap a day to move the workout,{"\n"} or tap the selected workout to cancel
              </Text>
            </View>
          )}
          <View style={styles.workoutsContainer}> 
            {workouts.map((item, index) => (
              <View key={item.date}>
                {renderDayCard(item, index)}
              </View>
            ))}
          </View>
    
          <CustomButton
            title="Save"
            backgroundColor="#000"
            textColor="#FFF"
            borderColor="#FFF"
            onPress={async () => {
              setSelectedWorkoutIndex(null);
              // Reload to ensure everything is saved
              await loadWorkouts();
              // Small delay to ensure data is persisted
              setTimeout(() => {
                navigation.goBack();
              }, 100);
            }}
          />
        </View>
      </StickyHeader>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dayCard: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 0,
    marginBottom: 5,
    overflow: 'hidden',
  },
  dayCardSelected: {
    borderColor: '#4DD4AC',
    borderWidth: 2,
    backgroundColor: '#1a1a1a',
  },
  dayCardDropTarget: {
    borderColor: '#4DD4AC',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  workoutsContainer: {
    marginBottom: 5,
  },
  instructionBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#4DD4AC',
    borderRadius: 0,
    padding: 12,
    marginBottom: 16,
  },
  instructionText: {
    color: '#4DD4AC',
    fontSize: 14,
    textAlign: 'center',
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
    color: '#999',
    marginBottom: 4,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dayTitleEmpty: {
    color: '#666',
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
    padding: 4,
  },
});

