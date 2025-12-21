// src/screens/app/Workouts/index.tsx
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { View, Dimensions, Text } from 'react-native';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import BottomTabs from '~/components/Layout/BottomTabs';
import SelectWeek from '~/components/Blocks/SelectWeek';
import HeaderText from '~/components/Layout/HeaderText';
import { useUserStore } from '~/data/store/userStore';

import { fetchDayByDate } from '~/data/supabase/workoutsHandler';
import { getLogsForDate } from '~/data/supabase/clientWorkoutLogsHandler';
import { groupBySupersetNumber, setsCountForGroup } from '~/data/helpers/workoutRun';
import { useMemo } from 'react';
import FirstItem from '~/components/Layout/FirstItem';
import Supersets from '~/components/Blocks/Supersets';
import CustomButton from '~/components/Buttons/CustomButton';
import { buildWeekStatus } from '~/data/helpers/weekStatus';
import Loading from '~/components/Loading';

const { height } = Dimensions.get('window');

export default function Workouts() {
  const navigation = useNavigation<any>();
  const todayISO = dayjs().format('YYYY-MM-DD');
  const client = useUserStore((s) => s.client);
  const trainingDays = client?.trainingDays ? client.trainingDays : []; 
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);

  const countSetsFromReps = (reps?: string | null) => {
    if (!reps) return 1;
    return reps.split(',').map(s => s.trim()).filter(Boolean).length || 1;
  };
  // week state (start on Monday of current week)
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'));
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const [statusByDate, setStatusByDate] = useState<Record<string, 'none'|'partial'|'done'>>({});
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  const clientId = client?.id;
  const displayName = client?.firstName ?? '';

  useEffect(() => {
    if (!client?.id) return;
    (async () => {
      setLoadingWeek(true);
      try {
        const map = await buildWeekStatus(client.id, weekStart);
        setStatusByDate(map);
      } finally {
        setLoadingWeek(false);
      }
    })();
  }, [client?.id, weekStart]);

  const loadSelectedDay = useCallback(async () => {
    if (!client?.id) return;
    setLoadingDay(true);
    try {
      const day = await fetchDayByDate(client.id, selectedDate);
      setSelectedDay(day);
    } finally {
      setLoadingDay(false);
    }
  }, [selectedDate, client?.id]);

  useEffect(() => {
    loadSelectedDay();
  }, [loadSelectedDay]);

  // Load logs for selected date
  useEffect(() => {
    if (!client?.id || !selectedDate) return;
    let alive = true;
    (async () => {
      try {
        const counts = await getLogsForDate(client.id, selectedDate);
        if (alive) setLogsCountByItem(counts);
      } catch (error) {
        console.error('Error loading logs:', error);
      }
    })();
    return () => { alive = false; };
  }, [client?.id, selectedDate]);

  // Reload when screen comes into focus (e.g., returning from ScheduleWorkout)
  useFocusEffect(
    useCallback(() => {
      loadSelectedDay();
      // Also reload week status
      if (client?.id) {
        (async () => {
          setLoadingWeek(true);
          try {
            const map = await buildWeekStatus(client.id, weekStart);
            setStatusByDate(map);
          } finally {
            setLoadingWeek(false);
          }
        })();
      }
      // Reload logs
      if (client?.id && selectedDate) {
        (async () => {
          try {
            const counts = await getLogsForDate(client.id, selectedDate);
            setLogsCountByItem(counts);
          } catch (error) {
            console.error('Error loading logs:', error);
          }
        })();
      }
    }, [loadSelectedDay, client?.id, weekStart, selectedDate])
  );

  // Find next exercise to do
  const findNextExercise = () => {
    if (!selectedDay?.items?.length) return null;

    const items = selectedDay.items;
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
    if (!selectedDay?.items?.length) return false;
    
    const items = selectedDay.items;
    return items.every((item: any) => {
      const repsArray = item.reps ? item.reps.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const totalSets = Math.max(repsArray.length, item.sets ?? 1);
      const loggedSets = logsCountByItem.get(item.id) ?? 0;
      return loggedSets >= totalSets;
    });
  }, [selectedDay?.items, logsCountByItem]);

  const handleStartWorkout = () => {
    // If workout is complete, navigate to first exercise's LogExercise in readonly
    if (isWorkoutComplete && selectedDay?.items?.length) {
      const firstItem = selectedDay.items[0];
      const repsArray = firstItem.reps ? firstItem.reps.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      const totalSets = Math.max(repsArray.length, firstItem.sets ?? 1);
      const itemsAll = selectedDay.items;
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

      navigation.navigate('LogExercise', {
        item: firstItem,
        setIndex: totalSets - 1,
        supersetNum: firstSupersetNum,
        itemsAll,
        idxAll,
        readonly: true,
        returnTo: 'Workouts',
        date: selectedDate,
      });
      return;
    }

    const next = findNextExercise();
    if (!next) return;

    const { item, setIndex, supersetNum } = next;
    const itemsAll = selectedDay.items;
    const idxAll = itemsAll.findIndex((x: any) => x.id === item.id);

    // Check if all sets are done for this exercise
    const repsArray = item.reps ? item.reps.split(',').map(s => s.trim()).filter(Boolean) : [];
    const totalSets = Math.max(repsArray.length, item.sets ?? 1);
    const loggedSets = logsCountByItem.get(item.id) ?? 0;
    const allSetsDone = loggedSets >= totalSets;
    

    if (allSetsDone) {
      navigation.navigate('LogExercise', {
        item,
        setIndex: totalSets - 1,
        supersetNum,
        itemsAll,
        idxAll,
        readonly: true,
        returnTo: 'Workouts',
        date: selectedDate,
      });
    } else {
      navigation.navigate('Exercise', {
        item,
        setIndex,
        supersetNum,
        itemsAll,
        idxAll,
        returnTo: 'Workouts',
      });
    }
  };


  return (
    <>
      <StickyHeader title="Workouts" noSticky padded={false}>
        <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 70 }]}>
          <HeaderText title={`Your workout week at a glance`} subtitle={'From ' + dayjs(weekStart).format('DD-MM') + ' to ' + dayjs(weekStart).add(6, 'day').format('DD-MM')}/>
        </View>
        <View style={{  }}>
          <SelectWeek
            weekStartISO={weekStart}
            selectedDateISO={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeWeek={(delta) =>
              setWeekStart(dayjs(weekStart).add(delta, 'week').format('YYYY-MM-DD'))
            }
            preferredDays={trainingDays as any}
            statusByDate={statusByDate}
            maxDateISO={todayISO}
          />
        </View>
        <View style={[__base.paddingHorizontal, { paddingBottom: 100, paddingTop: 30 }]}>
          {selectedDay?.title && (
            <Text style={[__base.textBold, { fontSize: 18, marginBottom: 10, textTransform: 'uppercase' }]}>
              {selectedDay.title}
            </Text>
          )}
          {(loadingDay || loadingWeek) ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: height-400, opacity: 0.2 }}>
              <Loading />
            </View>
          ) : selectedDay ? (
            <>
              <Supersets items={selectedDay.items ?? []} selectedDate={selectedDate} />
              <CustomButton
                title={isWorkoutComplete ? "Log Exercises" : "Start Workout"}
                backgroundColor="#000"
                textColor="#4DD4AC"
                borderColor="#4DD4AC"
                onPress={handleStartWorkout}
              />
            </>
          ) : (
            <FirstItem
              title="Today's Workout"
              icon="Barbell"
              description="Select your workout for this day"
              onClick={() => navigation.navigate('ScheduleWorkout', {
                isoDate: selectedDate,
              })}
            />
          )}
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
