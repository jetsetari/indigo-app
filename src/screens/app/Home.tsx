// src/screens/home/Home.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import BottomTabs from '~/components/Layout/BottomTabs';
import FirstItem from '~/components/Layout/FirstItem';
import Checklist from '~/components/Blocks/Checklist';
import SupersetsXs from '~/components/Blocks/Supersets/Xs';
import WorkoutPickCard, { workoutPreviewLine } from '~/components/Blocks/WorkoutPickCard';
import Loading from '~/components/Loading';
import { Badge } from '~/components/Layout/Badge';

import { useUserStore } from '~/data/store/userStore';
import {
  fetchDayByDate,
  fetchSelectableWeekWorkouts,
  fetchUpcomingWorkouts,
  moveWorkoutToDate,
  skipWorkoutDay,
  type SelectableWeekWorkout,
} from '~/data/supabase/workoutsHandler';
import { getLogsForDate, getTotalWorkouts, getWorkoutStreak } from '~/data/supabase/clientWorkoutLogsHandler';
import { groupBySupersetNumber, setsCountForItem, findNextIncompleteStep } from '~/data/helpers/workoutRun';
import { formatDisplayDateWeekday, localTodayISO } from '~/data/helpers/date';

import __base from '~/assets/styles/base';
import { styles } from '~/assets/styles/screens/StartStyles';
import StartWorkoutButton from '~/components/Buttons/StartWorkoutButton';

export default function Home() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);

  const mode = "production" as "debug" | "production"; // "debug" or "production"

  const displayName = client?.firstName ?? '';
  const avatarUrl = client?.avatarUrl ?? undefined;

  const [loading, setLoading] = useState(true);
  const [todayDay, setTodayDay] = useState<any | null>(null);
  const [weekOptions, setWeekOptions] = useState<SelectableWeekWorkout[]>([]);
  const [upcomingOptions, setUpcomingOptions] = useState<SelectableWeekWorkout[]>([]);
  const [movingDayId, setMovingDayId] = useState<number | null>(null);
  const [skippingDayId, setSkippingDayId] = useState<number | null>(null);
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  const [badges, setBadges] = useState({
    streak: 0,
    totalWorkouts: 0,
  });

  const loadTodayDay = useCallback(async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const todayISO = localTodayISO();
      const [day, options] = await Promise.all([
        fetchDayByDate(client.id, todayISO),
        fetchSelectableWeekWorkouts(client.id, todayISO, 8),
      ]);
      setTodayDay(day);
      setWeekOptions(options);
      setUpcomingOptions(
        !day && options.length === 0
          ? await fetchUpcomingWorkouts(client.id, todayISO, 3)
          : []
      );
    } catch {
      setTodayDay(null);
      setWeekOptions([]);
      setUpcomingOptions([]);
    } finally {
      setLoading(false);
    }
  }, [client?.id]);

  useEffect(() => {
    loadTodayDay();
  }, [loadTodayDay]);

  // Load logs for today
  useEffect(() => {
    if (!client?.id) return;
    let alive = true;
    (async () => {
      try {
        const todayISO = localTodayISO();
        const counts = await getLogsForDate(client.id, todayISO);
        if (alive) setLogsCountByItem(counts);
      } catch (error) {
        console.error('Error loading logs:', error);
      }
    })();
    return () => { alive = false; };
  }, [client?.id]);

  // Load badges
  useEffect(() => {
    if (!client?.id) return;
    
    if (mode === "debug" as const) {
      // Dummy data for testing
      setBadges({
        streak: 3,
        totalWorkouts: 10,
      });
    } else {
      // Production: fetch actual data
      (async () => {
        try {
          const [streak, total] = await Promise.all([
            getWorkoutStreak(client.id),
            getTotalWorkouts(client.id),
          ]);
          setBadges({
            streak,
            totalWorkouts: total,
          });
        } catch (error) {
          console.error('Error loading badges:', error);
        }
      })();
    }
  }, [client?.id, mode]);

  // Reload when screen comes into focus (e.g., returning from Workouts/ScheduleWorkout)
  useFocusEffect(
    useCallback(() => {
      loadTodayDay();
      // Reload logs
      if (client?.id) {
        (async () => {
          try {
            const todayISO = localTodayISO();
            const counts = await getLogsForDate(client.id, todayISO);
            setLogsCountByItem(counts);
          } catch (error) {
            console.error('Error loading logs:', error);
          }
        })();
      }
      // Reload badges in production mode
      if (mode === "production" && client?.id) {
        (async () => {
          try {
            const [streak, total] = await Promise.all([
              getWorkoutStreak(client.id),
              getTotalWorkouts(client.id),
            ]);
            setBadges({
              streak,
              totalWorkouts: total,
            });
          } catch (error) {
            console.error('Error loading badges:', error);
          }
        })();
      }
    }, [loadTodayDay, client?.id, mode])
  );

  const handleSelectWeekWorkout = (workout: SelectableWeekWorkout) => {
    if (!client?.id || movingDayId || skippingDayId) return;

    const title = workout.title?.trim() || `Day ${workout.dayIndex}`;
    const fromLabel = workoutDateLabel(workout);
    const todayISO = localTodayISO();
    const message = workout.date
      ? `Move "${title}" from ${fromLabel} to today so you can train now.`
      : `Assign "${title}" to today so you can train now.`;

    Alert.alert(
      'Do this workout today?',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to today',
          onPress: async () => {
            setMovingDayId(workout.id);
            try {
              await moveWorkoutToDate(
                client.id,
                workout.id,
                workout.date,
                todayISO,
                todayDay?.id
              );
              await loadTodayDay();
              const counts = await getLogsForDate(client.id, todayISO);
              setLogsCountByItem(counts);
            } catch (error) {
              console.error('Error moving workout to today:', error);
              Alert.alert('Could not move workout', 'Please try again.');
            } finally {
              setMovingDayId(null);
            }
          },
        },
      ]
    );
  };

  const handleSkipWorkout = (workout: SelectableWeekWorkout) => {
    if (movingDayId || skippingDayId) return;

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
            setSkippingDayId(workout.id);
            try {
              await skipWorkoutDay(workout.id);
              await loadTodayDay();
            } catch (error) {
              console.error('Error skipping workout:', error);
              Alert.alert('Could not skip workout', 'Please try again.');
            } finally {
              setSkippingDayId(null);
            }
          },
        },
      ]
    );
  };

  const renderWorkoutCards = (options: SelectableWeekWorkout[]) =>
    options.map((workout) => {
      const title = workout.title?.trim() || `Day ${workout.dayIndex}`;
      const dayLabel = workoutDateLabel(workout);
      const isMoving = movingDayId === workout.id;
      const isSkipping = skippingDayId === workout.id;
      const isBusy = movingDayId !== null || skippingDayId !== null;

      return (
        <WorkoutPickCard
          key={workout.id}
          dateLabel={dayLabel}
          title={title}
          preview={workoutPreviewLine(workout.previewExercises, workout.items?.length)}
          isMissed={workout.isMissed}
          busy={isMoving || isSkipping}
          disabled={isBusy}
          onSelect={() => handleSelectWeekWorkout(workout)}
          onSkip={workout.isMissed ? () => handleSkipWorkout(workout) : undefined}
        />
      );
    });

  // Find next incomplete exercise in supersets order (skips already-logged sets)
  const findNextExercise = () => {
    if (!todayDay?.items?.length) return null;
    return findNextIncompleteStep(todayDay.items, logsCountByItem);
  };

  // Check if entire workout is complete
  const isWorkoutComplete = useMemo(() => {
    if (!todayDay?.items?.length) return false;
    
    const items = todayDay.items;
    return items.every((item: any) => {
      const totalSets = setsCountForItem(items, item.id);
      const loggedSets = logsCountByItem.get(item.id) ?? 0;
      return loggedSets >= totalSets;
    });
  }, [todayDay?.items, logsCountByItem]);

  const handleStartWorkout = () => {
    // If workout is complete, navigate to first exercise's LogExercise in readonly
    if (isWorkoutComplete && todayDay?.items?.length) {
      const firstItem = todayDay.items[0];
      const itemsAll = todayDay.items;
      const totalSets = setsCountForItem(itemsAll, firstItem.id);
      const idxAll = 0;
      
      // Find superset number for first item
      const groupMap = groupBySupersetNumber(itemsAll);
      let firstSupersetNum = 0;
      for (const [key, groupItems] of groupMap.entries()) {
        if (groupItems.some((i: any) => i.id === firstItem.id)) {
          firstSupersetNum = key;
          break;
        }
      }

      const todayISO = localTodayISO();
      navigation.navigate('LogExercise', {
        item: firstItem,
        setIndex: totalSets - 1,
        supersetNum: firstSupersetNum,
        itemsAll,
        idxAll,
        mode: 'history',
        returnTo: 'Home',
        date: todayISO,
      });
      return;
    }

    const next = findNextExercise();
    if (!next) return;

    const { item, setIndex, supersetNum } = next;
    const itemsAll = todayDay.items;
    const idxAll = itemsAll.findIndex((x: any) => x.id === item.id);

    // Check if all sets are done for this exercise
    const totalSets = setsCountForItem(itemsAll, item.id);
    const loggedSets = logsCountByItem.get(item.id) ?? 0;
    const allSetsDone = loggedSets >= totalSets;

    if (allSetsDone) {
      const todayISO = localTodayISO();
      navigation.navigate('LogExercise', {
        item,
        setIndex: totalSets - 1,
        supersetNum,
        itemsAll,
        idxAll,
        mode: 'history',
        returnTo: 'Home',
        date: todayISO,
      });
    } else {
      navigation.navigate('Exercise', {
        item,
        setIndex,
        supersetNum,
        itemsAll,
        idxAll,
        returnTo: 'Home',
      });
    }
  };

  if (loading) return <Loading />;

  // Badge data
  const hasStreakBadge = badges.streak >= 3;
  const hasTotalWorkoutsBadge = badges.totalWorkouts >= 10;

  return (
    <>
      <StickyHeader title="Home" noSticky>
        <HeaderWithExtra title={`Welcome, ${displayName} 👋🏼`} subtitle="Let’s Take The Work Out." image={avatarUrl} />

        <View style={styles.section}>
          {todayDay ? (
            <>
              <StartWorkoutButton
                complete={isWorkoutComplete}
                label={todayDay.title ? `Start ${todayDay.title}` : 'Start'}
                completeLabel={todayDay.title ? `Edit ${todayDay.title}` : 'Edit'}
                backgroundColor="#000"
                textColor="#FFF"
                borderColor="#FFF"
                fullWidth
                onPress={handleStartWorkout}
              />
              <SupersetsXs items={todayDay.items ?? []} selectedDate={localTodayISO()} />
            </>
          ) : weekOptions.length > 0 ? (
            <View style={homeStyles.pickSection}>
              <Text style={[__base.textBold, { marginBottom: 4 }]}>
                {weekOptions.some((workout) => workout.isMissed) ? 'Missed workouts' : "Today's Workout"}
              </Text>
              {renderWorkoutCards(weekOptions)}
            </View>
          ) : upcomingOptions.length > 0 ? (
            <View style={homeStyles.pickSection}>
              <Text style={[__base.textBold, { marginBottom: 4 }]}>Upcoming workouts</Text>
              {renderWorkoutCards(upcomingOptions)}
            </View>
          ) : (
            <FirstItem
              title="Today's Workout"
              icon="Barbell"
              description={`All workouts of the week done.\nManage your schedule in the Workouts screen.`}
              onClick={() => navigation.navigate('Schedule', { returnTo: 'Home' })}
            />
          )}
           {/* Badges Section */}
          {(hasStreakBadge || hasTotalWorkoutsBadge) && (
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={[__base.textBold]}>Badges</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                {hasStreakBadge && (
                  <View style={{ alignItems: 'center', gap: 5 }}>
                    <Badge
                      size={80}
                      border="#FF8C42"
                      background="#FF6B1A"
                      icon="zap"
                    />
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
                      {badges.streak} Day streak
                    </Text>
                  </View>
                )}
                {hasTotalWorkoutsBadge && (
                  <View style={{ alignItems: 'center', gap: 5 }}>
                    <Badge
                      size={80}
                      border="#4DD4AC"
                      background="#22C55E"
                      icon="award"
                    />
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
                      {badges.totalWorkouts} Total workouts
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={{ marginTop: 20 }}>
            <Checklist />
          </View>
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}

function workoutDateLabel(workout: SelectableWeekWorkout): string {
  if (!workout.date) return `Day ${workout.dayIndex}`;

  const date = dayjs(workout.date);
  const today = dayjs();
  const weekEnd = today.subtract((today.day() + 6) % 7, 'day').add(6, 'day');
  return date.isAfter(weekEnd, 'day') ? formatDisplayDateWeekday(workout.date) : date.format('dddd');
}

const homeStyles = StyleSheet.create({
  pickSection: {
    marginTop: 8,
    marginBottom: 10,
    gap: 8,
  },
});
