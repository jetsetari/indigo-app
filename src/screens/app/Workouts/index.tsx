import React, { useState } from 'react';
import { View } from 'react-native';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import WeekCalendar from '~/components/Form/WeekCalendar';
import PlanCard from '~/components/Layout/Blocks/PlanCard';
import WorkoutDayCard from '~/components/Layout/Blocks/WorkoutDayCard';
import BottomTabs from '~/components/Layout/BottomTabs';

import Overview from './Overview';

import __base from '~/assets/styles/base';
import styles from '~/assets/styles/screens/WorkoutStyles';

import { plansExamples } from '~/data/content/options';

export default function WorkoutScreen() {
  const [exercise, setExercise] = useState(false);

  if(exercise) return <Overview onBack={() => setExercise(false)} />

  return (
    <>
      <StickyHeader title="Workout Plan" noSticky={true}>
        <HeaderText title="Pick your perfect plan" subtitle="Cut fat, gain muscle, or fight like a warrior." />
        <WeekCalendar />
        {plansExamples.map(plan => (
          <View key={plan.id} style={styles.planBlock}>
            <PlanCard title={plan.title} description={plan.subtitle} image={plan.image} onPress={() => setExercise(true)} />
            {plan.days.map((day, index) => (
              <WorkoutDayCard key={index} focus={day.label} day={`${day.day} | ${day.label}`} completed={day.completed}  onPress={() => setExercise(true)} />
            ))}
          </View>
        ))}
        <View style={__base.footerSpace} />
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
