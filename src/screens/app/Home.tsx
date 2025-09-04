import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StickyHeader from '~/components/Layout/StickyHeader';
import BottomTabs from '~/components/Layout/BottomTabs';
import SingleSelectSection from '~/components/Form/SingleSelectSelection';
import CustomButton from '~/components/Buttons/CustomButton';
import CustomIcon from '~/components/Layout/CustomIcon';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import Loading from '~/components/Loading';
import { useUserStore } from '~/data/store/userStore';

import { mapItemsToOptions } from '~/data/helpers/homeMap';


import { getFirstWeekOfProgram2, getProgramWeekWithExercises } from '~/data/supabase/workoutsHandler';
// keep your existing fallback list import
import { workouts as fallbackWorkouts } from '~/data/content/options';

import __base from '~/assets/styles/base';
import { styles } from '~/assets/styles/screens/StartStyles';

export default function Home() {
  const navigation = useNavigation<any>();
  const client = useUserStore(s => s.client);
  const displayName = client?.first_name ?? '';
  const avatarUrl = client?.avatar_url ?? undefined;

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>('');
  const [options, setOptions] = useState<{ label: string; value: string; slug: string; image?: any, screen: string }[]>(fallbackWorkouts);
  //const [week, setWeek] = useState<ProgramWeek | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const week = await getProgramWeekWithExercises(2, 1); // program 2, week 1

      if (!alive) return;
      const day1 = week?.days?.[0];
      const opts = mapItemsToOptions(day1?.items ?? []);
      setOptions(opts);

      setSelected(opts[0]?.value ?? '');
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <StickyHeader title="Home" noSticky>
        <HeaderWithExtra title={`Welcome, ${displayName}`} subtitle="Let’s build your strongest self." image={avatarUrl} />

        <View style={__base.infoBox}>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Weight" size={25} />
            <Text style={__base.infoBoxValue}>98kg</Text>
            <Text style={__base.infoBoxLabel}>Weight</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Birthday" size={25} />
            <Text style={__base.infoBoxValue}>16%</Text>
            <Text style={__base.infoBoxLabel}>Bodyfat</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[__base.textBold]}>Workout of Today</Text>
            <TouchableOpacity><Text style={__base.link}>See details</Text></TouchableOpacity>
          </View>

          <SingleSelectSection
            options={options}     
            selected={selected}
            onChange={setSelected}
          />

          <CustomButton
            title="Start Workout"
            backgroundColor="#000"
            borderColor="#00FFB0"
            textColor="#00FFB0"
            onPress={() => navigation.navigate('Workouts', { slug: selected })}
            disabled={!selected}
          />
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
