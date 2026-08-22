// src/screens/app/Workouts/index.tsx
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { View, Dimensions, Text } from 'react-native';
import StickyHeader from '~/components/Layout/StickyHeader';
import WhiteRefreshControl from '~/components/Layout/WhiteRefreshControl';
import __base from '~/assets/styles/base';
import BottomTabs from '~/components/Layout/BottomTabs';
import SelectWeek from '~/components/Blocks/SelectWeek';
import HeaderText from '~/components/Layout/HeaderText';
import { useUserStore } from '~/data/store/userStore';

import { fetchDayByDate } from '~/data/supabase/workoutsHandler';
import { getLogsForDate } from '~/data/supabase/clientWorkoutLogsHandler';
import { groupBySupersetNumber, setsCountForItem, findNextIncompleteStep } from '~/data/helpers/workoutRun';
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
  const [refreshing, setRefreshing] = useState(false);

  // week state (start on Monday of current week)
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'));
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const [statusByDate, setStatusByDate] = useState<Record<string, 'none'|'partial'|'done'>>({});
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  const clientId = client?.id;
  const displayName = client?.firstName ?? '';

  const loadWeekStatus = useCallback(async (opts?: { silent?: boolean }) => {
    if (!client?.id) return;
    if (!opts?.silent) setLoadingWeek(true);
    try {
      const map = await buildWeekStatus(client.id, weekStart);
      setStatusByDate(map);
    } finally {
      if (!opts?.silent) setLoadingWeek(false);
    }
  }, [client?.id, weekStart]);

  useEffect(() => {
    if (!client?.id) return;
    loadWeekStatus();
  }, [client?.id, weekStart, loadWeekStatus]);

  const loadSelectedDay = useCallback(async (opts?: { silent?: boolean }) => {
    if (!client?.id) return;
    if (!opts?.silent) setLoadingDay(true);
    try {
      const day = await fetchDayByDate(client.id, selectedDate);
      setSelectedDay(day);
    } finally {
      if (!opts?.silent) setLoadingDay(false);
    }
  }, [selectedDate, client?.id]);

  const loadLogs = useCallback(async () => {
    if (!client?.id || !selectedDate) return;
    try {
      const counts = await getLogsForDate(client.id, selectedDate);
      setLogsCountByItem(counts);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }, [client?.id, selectedDate]);

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

  const onRefresh = useCallback(async () => {
    if (!client?.id) return;
    setRefreshing(true);
    try {
      await Promise.all([
        loadWeekStatus({ silent: true }),
        loadSelectedDay({ silent: true }),
        loadLogs(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [client?.id, loadWeekStatus, loadSelectedDay, loadLogs]);

  // Reload when screen comes into focus (e.g., returning from ScheduleWorkout)
  useFocusEffect(
    useCallback(() => {
      loadSelectedDay({ silent: true });
      loadWeekStatus({ silent: true });
      loadLogs();
    }, [loadSelectedDay, loadWeekStatus, loadLogs])
  );

  // Find next incomplete exercise in supersets order (skips already-logged sets)
  const findNextExercise = () => {
    if (!selectedDay?.items?.length) return null;
    return findNextIncompleteStep(selectedDay.items, logsCountByItem);
  };

  // Check if entire workout is complete
  const isWorkoutComplete = useMemo(() => {
    if (!selectedDay?.items?.length) return false;
    
    const items = selectedDay.items;
    return items.every((item: any) => {
      const totalSets = setsCountForItem(items, item.id);
      const loggedSets = logsCountByItem.get(item.id) ?? 0;
      return loggedSets >= totalSets;
    });
  }, [selectedDay?.items, logsCountByItem]);

  const handleStartWorkout = () => {
    // If workout is complete, navigate to first exercise's LogExercise in readonly
    if (isWorkoutComplete && selectedDay?.items?.length) {
      const firstItem = selectedDay.items[0];
      const itemsAll = selectedDay.items;
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

      navigation.navigate('LogExercise', {
        item: firstItem,
        setIndex: totalSets - 1,
        supersetNum: firstSupersetNum,
        itemsAll,
        idxAll,
        mode: 'history',
        returnTo: 'Schedule',
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
    const totalSets = setsCountForItem(itemsAll, item.id);
    const loggedSets = logsCountByItem.get(item.id) ?? 0;
    const allSetsDone = loggedSets >= totalSets;
    

    if (allSetsDone) {
      navigation.navigate('LogExercise', {
        item,
        setIndex: totalSets - 1,
        supersetNum,
        itemsAll,
        idxAll,
        mode: 'history',
        returnTo: 'Schedule',
        date: selectedDate,
      });
    } else {
      navigation.navigate('Exercise', {
        item,
        setIndex,
        supersetNum,
        itemsAll,
        idxAll,
        returnTo: 'Schedule',
      });
    }
  };


  return (
    <>
      <StickyHeader
        title="Workouts"
        noSticky
        padded={false}
        refreshing={refreshing}
        refreshControl={
          <WhiteRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
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
