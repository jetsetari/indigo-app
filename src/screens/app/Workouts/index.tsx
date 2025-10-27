// src/screens/app/Workouts/index.tsx
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { View } from 'react-native';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import BottomTabs from '~/components/Layout/BottomTabs';
import SelectWeek from '~/components/Blocks/SelectWeek';
import HeaderText from '~/components/Layout/HeaderText';
import { useUserStore } from '~/data/store/userStore';

import {  getScheduleByDate } from '~/data/supabase/workoutSchedulesHandler';
import { fetchDayWithItems } from '~/data/supabase/workoutsHandler';
import FirstItem from '~/components/Layout/FirstItem';
import Supersets from '~/components/Blocks/Supersets';
import CustomButton from '~/components/Buttons/CustomButton';
import { buildWeekStatus } from '~/data/helpers/weekStatus';
import Loading from '~/components/Loading';
import { Dimensions } from 'react-native';

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
  const clientId = client?.id;

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

  useEffect(() => {
    (async () => {
      setLoadingDay(true);
      try {
        const schedule = await getScheduleByDate(selectedDate);
        const day = schedule?.workout_day_id
          ? await fetchDayWithItems(schedule.workout_day_id)
          : null;
        setSelectedDay(day);
      } finally {
        setLoadingDay(false);
      }
    })();
  }, [selectedDate]);


  return (
    <>
      <StickyHeader title="Workouts" noSticky padded={false}>
        <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 70 }]}>
          <HeaderText title={`Pick your perfect plan`} subtitle="Cut fat, gain muscle, or fight like a warrior."/>
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
          {(loadingDay || loadingWeek) ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: height-400, opacity: 0.2 }}>
              <Loading />
            </View>
          ) : selectedDay ? (
            <>
              <Supersets items={selectedDay.items ?? []} />
              <CustomButton
                title="Start Workout"
                backgroundColor="#000"
                textColor="#4DD4AC"
                borderColor="#4DD4AC"
                onPress={() =>
                  navigation.navigate('StartWorkout', {
                    items: selectedDay.items,
                    supersetNum: 1,
                  })
                }
              />
            </>
          ) : (
            <FirstItem
              title="Select Workout"
              icon="Barbell"
              description="Select your workout for this day"
              onClick={() => navigation.navigate('SelectWorkout', {
                isoDate: selectedDate,
                returnTo: 'Workouts',
              })}
            />
          )}
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
