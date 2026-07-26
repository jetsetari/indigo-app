// src/screens/home/Home.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Feather } from '@expo/vector-icons';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import BottomTabs from '~/components/Layout/BottomTabs';
import FirstItem from '~/components/Layout/FirstItem';
import Checklist from '~/components/Blocks/Checklist';
import SupersetsXs from '~/components/Blocks/Supersets/Xs';
import Loading from '~/components/Loading';
import { Badge } from '~/components/Layout/Badge';

import { useUserStore } from '~/data/store/userStore';
import {
  fetchDayByDate,
  fetchSelectableWeekWorkouts,
  moveWorkoutToDate,
  type SelectableWeekWorkout,
} from '~/data/supabase/workoutsHandler';
import { getLogsForDate, getTotalWorkouts, getWorkoutStreak } from '~/data/supabase/clientWorkoutLogsHandler';
import { groupBySupersetNumber, setsCountForGroup } from '~/data/helpers/workoutRun';

import __base from '~/assets/styles/base';
import { styles } from '~/assets/styles/screens/StartStyles';
import InfoBox from '~/components/Layout/InfoBox';
import CustomButton from '~/components/Buttons/CustomButton';

export default function Home() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);

  const mode = "production" as "debug" | "production"; // "debug" or "production"

  const displayName = client?.firstName ?? '';
  const avatarUrl = client?.avatarUrl ?? undefined;

  const [loading, setLoading] = useState(true);
  const [todayDay, setTodayDay] = useState<any | null>(null);
  const [weekOptions, setWeekOptions] = useState<SelectableWeekWorkout[]>([]);
  const [movingDayId, setMovingDayId] = useState<number | null>(null);
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  const [badges, setBadges] = useState({
    streak: 0,
    totalWorkouts: 0,
  });

  const loadTodayDay = useCallback(async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const todayISO = new Date().toISOString().slice(0, 10);
      const day = await fetchDayByDate(client.id, todayISO);
      setTodayDay(day);
      if (!day) {
        const options = await fetchSelectableWeekWorkouts(client.id, todayISO, 3);
        setWeekOptions(options);
      } else {
        setWeekOptions([]);
      }
    } catch {
      setTodayDay(null);
      setWeekOptions([]);
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
        const todayISO = new Date().toISOString().slice(0, 10);
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
            const todayISO = new Date().toISOString().slice(0, 10);
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
    if (!client?.id || movingDayId) return;

    const title = workout.title?.trim() || `Day ${workout.dayIndex}`;
    const fromLabel = workout.date
      ? dayjs(workout.date).format('dddd')
      : `Day ${workout.dayIndex}`;
    const todayISO = new Date().toISOString().slice(0, 10);
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
              await moveWorkoutToDate(client.id, workout.id, workout.date, todayISO);
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

  // Find next exercise to do
  const findNextExercise = () => {
    if (!todayDay?.items?.length) return null;

    const items = todayDay.items;
    const groupMap = groupBySupersetNumber(items);
    const supersetKeys = Array.from(groupMap.keys()).sort((a, b) => a - b);

    // Find first superset with incomplete exercises
    for (const supersetNum of supersetKeys) {
      const group = groupMap.get(supersetNum) ?? [];
      const totalSets = setsCountForGroup(group);

      // Check each set
      for (let setIndex = 0; setIndex < totalSets; setIndex++) {
        // Find first exercise in this set that's not done
        for (const item of group) {
          const loggedSets = logsCountByItem.get(item.id) ?? 0;
          if (loggedSets <= setIndex) {
            return { item, setIndex, supersetNum };
          }
        }
      }
    }

    // All done, return first exercise
    const firstSuperset = supersetKeys[0] ?? 0;
    const firstGroup = groupMap.get(firstSuperset) ?? [];
    if (firstGroup.length > 0) {
      return { item: firstGroup[0], setIndex: 0, supersetNum: firstSuperset };
    }

    return null;
  };

  // Check if entire workout is complete
  const isWorkoutComplete = useMemo(() => {
    if (!todayDay?.items?.length) return false;
    
    const items = todayDay.items;
    return items.every((item: any) => {
      const repsArray = item.reps ? item.reps.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const totalSets = Math.max(repsArray.length, item.sets ?? 1);
      const loggedSets = logsCountByItem.get(item.id) ?? 0;
      return loggedSets >= totalSets;
    });
  }, [todayDay?.items, logsCountByItem]);

  const handleStartWorkout = () => {
    // If workout is complete, navigate to first exercise's LogExercise in readonly
    if (isWorkoutComplete && todayDay?.items?.length) {
      const firstItem = todayDay.items[0];
      const repsArray = firstItem.reps ? firstItem.reps.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const totalSets = Math.max(repsArray.length, firstItem.sets ?? 1);
      const itemsAll = todayDay.items;
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

      const todayISO = new Date().toISOString().slice(0, 10);
      navigation.navigate('LogExercise', {
        item: firstItem,
        setIndex: totalSets - 1,
        supersetNum: firstSupersetNum,
        itemsAll,
        idxAll,
        readonly: true,
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
    const repsArray = item.reps ? item.reps.split(',').map(s => s.trim()).filter(Boolean) : [];
    const totalSets = Math.max(repsArray.length, item.sets ?? 1);
    const loggedSets = logsCountByItem.get(item.id) ?? 0;
    const allSetsDone = loggedSets >= totalSets;

    if (allSetsDone) {
      const todayISO = new Date().toISOString().slice(0, 10);
      navigation.navigate('LogExercise', {
        item,
        setIndex: totalSets - 1,
        supersetNum,
        itemsAll,
        idxAll,
        readonly: true,
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

  const infoBoxItems = {
    box1: { icon: 'Weight',   value: '98kg', label: 'Weight' },
    box2: { icon: 'Birthday', value: '16%',  label: 'Bodyfat' },
  };

  if (loading) return <Loading />;

  // Badge data
  const hasStreakBadge = badges.streak >= 3;
  const hasTotalWorkoutsBadge = badges.totalWorkouts >= 10;

  return (
    <>
      <StickyHeader title="Home" noSticky>
        <HeaderWithExtra title={`Welcome, ${displayName} 👋🏼`} subtitle="Let's build your strongest self." image={avatarUrl} />
        <InfoBox box1={infoBoxItems.box1} box2={infoBoxItems.box2} />
        
       
        
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[__base.textBold]}>Today's Workout{todayDay?.title ? (': ' + todayDay.title) : ''}</Text>
          </View>
          {todayDay ? (
            <View style={styles.section}>
              <SupersetsXs items={todayDay.items ?? []} selectedDate={new Date().toISOString().slice(0, 10)} />
              <CustomButton title={isWorkoutComplete ? "Edit Exercises" : "Start Workout"} backgroundColor="#000" textColor="#4DD4AC" borderColor='#4DD4AC' onPress={handleStartWorkout} />
            </View>
          ) : weekOptions.length > 0 ? (
            <View style={homeStyles.pickSection}>
              <Text style={homeStyles.pickHint}>
                No workout scheduled for today. Pick one from this week to train now.
              </Text>
              {weekOptions.map((workout) => {
                const title = workout.title?.trim() || `Day ${workout.dayIndex}`;
                const dayLabel = workout.date
                  ? dayjs(workout.date).format('dddd')
                  : `Day ${workout.dayIndex}`;
                const isMoving = movingDayId === workout.id;
                return (
                  <TouchableOpacity
                    key={workout.id}
                    style={[homeStyles.pickCard, isMoving && homeStyles.pickCardDisabled]}
                    onPress={() => handleSelectWeekWorkout(workout)}
                    disabled={movingDayId !== null}
                    activeOpacity={0.7}
                  >
                    <View style={homeStyles.pickCardBody}>
                      <View style={homeStyles.pickCardHeader}>
                        <View style={homeStyles.pickCardLeft}>
                          <Text style={homeStyles.pickDay}>{dayLabel}</Text>
                          <Text style={homeStyles.pickTitle}>{title}</Text>
                        </View>
                        {isMoving ? (
                          <ActivityIndicator color="#4DD4AC" />
                        ) : (
                          <Feather name="chevron-right" size={22} color="#888" />
                        )}
                      </View>
                      {workout.previewExercises.length > 0 && (
                        <View style={homeStyles.previewList}>
                          {workout.previewExercises.map((name, index) => (
                            <Text
                              key={`${workout.id}-${index}`}
                              style={[
                                homeStyles.previewExercise,
                                { opacity: PREVIEW_OPACITIES[index] ?? 0.08 },
                              ]}
                              numberOfLines={1}
                            >
                              {name}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => navigation.navigate('Schedule', { returnTo: 'Home' })}
                style={homeStyles.manageLink}
              >
                <Text style={homeStyles.manageLinkText}>Manage schedule in Workouts</Text>
              </TouchableOpacity>
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


          <Checklist />
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}

const PREVIEW_OPACITIES = [0.55, 0.35, 0.2, 0.1];

const homeStyles = StyleSheet.create({
  pickSection: {
    marginTop: 8,
    marginBottom: 10,
    gap: 8,
  },
  pickHint: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 4,
  },
  pickCard: {
    backgroundColor: '#111',
    borderColor: '#333',
    borderWidth: 1,
    padding: 12,
  },
  pickCardDisabled: {
    opacity: 0.6,
  },
  pickCardBody: {
    gap: 8,
  },
  pickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickCardLeft: {
    flex: 1,
  },
  pickDay: {
    color: '#999',
    fontSize: 13,
    marginBottom: 2,
  },
  pickTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewList: {
    gap: 2,
    paddingRight: 28,
  },
  previewExercise: {
    color: '#FFF',
    fontSize: 13,
  },
  manageLink: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  manageLinkText: {
    color: '#4DD4AC',
    fontSize: 13,
  },
});
