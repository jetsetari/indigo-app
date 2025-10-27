// src/screens/home/Home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import BottomTabs from '~/components/Layout/BottomTabs';
import FirstItem from '~/components/Layout/FirstItem';
import Checklist from '~/components/Blocks/Checklist';
import SupersetsXs from '~/components/Blocks/Supersets/Xs';
import Loading from '~/components/Loading';

import { useUserStore } from '~/data/store/userStore';
import { getScheduleByDate } from '~/data/supabase/workoutSchedulesHandler';
import { fetchDayWithItems } from '~/data/supabase/workoutsHandler';

import __base from '~/assets/styles/base';
import { styles } from '~/assets/styles/screens/StartStyles';
import InfoBox from '~/components/Layout/InfoBox';
import CustomButton from '~/components/Buttons/CustomButton';

export default function Home() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);

  const displayName = client?.firstName ?? '';
  const avatarUrl = client?.avatarUrl ?? undefined;

  const [loading, setLoading] = useState(true);
  const [todayDay, setTodayDay] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const schedule = await getScheduleByDate();
        const day = schedule?.workout_day_id
          ? await fetchDayWithItems(schedule.workout_day_id)
          : null;
        setTodayDay(day);
      } catch { setTodayDay(null) } finally { setLoading(false)}
    })();
  }, []);

  const infoBoxItems = {
    box1: { icon: 'Weight',   value: '98kg', label: 'Weight' },
    box2: { icon: 'Birthday', value: '16%',  label: 'Bodyfat' },
  };

  if (loading) return <Loading />;

  return (
    <>
      <StickyHeader title="Home" noSticky>
        <HeaderWithExtra title={`Welcome, ${displayName} 👋🏼`} subtitle="Let’s build your strongest self." image={avatarUrl} />
        <InfoBox box1={infoBoxItems.box1} box2={infoBoxItems.box2} />
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[__base.textBold]}>Workout of Today</Text>
          </View>
          {todayDay ? (
            <View style={styles.section}>
              <SupersetsXs items={todayDay.items ?? []} />
              <CustomButton title={'Start Workout'} backgroundColor="#000" textColor="#4DD4AC" borderColor='#4DD4AC' onPress={() => navigation.navigate('StartWorkout', { items: todayDay.items, supersetNum: 1 })} />
            </View>
          ) : (
            <FirstItem title="Select Workout" icon="Barbell" description="Select your workout for today" onClick={() => navigation.navigate('SelectWorkout', { returnTo: 'Home' })} />
          )}
          <Checklist />
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
