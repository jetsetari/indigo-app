// components/Layout/Blocks/ExerciseView.tsx
import React, { useState } from 'react';
import HeaderTitleImage from '~/components/Layout/HeaderTitleImage';
import StickyHeader from '~/components/Layout/StickyHeader';
import { View, Text } from 'react-native';

import __base from '~/assets/styles/base';
import CustomIcon from '~/components/Layout/CustomIcon';
import FormDropdown from '~/components/Form/Dropdown';
import PlanCard from '~/components/Layout/Blocks/PlanCard';
import CustomButton from '~/components/Buttons/CustomButton';

import { workoutExercises, workoutsList } from '~/data/content/options';
import Timer from './Timer';


export default function ExerciseView({ onBack }: { onBack: () => void; }) {

  const [workout, setWorkout] = useState<string>('upper-body-strength');
  const [week, setWeek] = useState<string>('week-1');
  const [exercise, setExercise] = useState(false);

  if(exercise) return <Timer onBack={() => setExercise(false)} />
  return (
    <StickyHeader title="Workout Plan" noSticky={true} padded={false} >
       <HeaderTitleImage  
        image={require('~/assets/images/dummy/workout-1.jpg')}
        subtitle="Upper Body Strength"
        title="Cutting Plan"
        onBack={onBack}
      />
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={[__base.textSubline]}>
          Burn fat while keeping your hard-earned muscle. This plan combines strength training and high-intensity workouts to help you get lean, defined, and strong — not skinny.
        </Text>
      
        <View style={__base.space} />
        <View style={__base.infoBox}>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Barbell" size={25} />
            <Text style={__base.infoBoxValue}>9</Text>
            <Text style={__base.infoBoxLabel}>Exercises</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Time" size={25} />
            <Text style={__base.infoBoxValue}>83</Text>
            <Text style={__base.infoBoxLabel}>Minutes</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Kcal" size={25} />
            <Text style={__base.infoBoxValue}>450</Text>
            <Text style={__base.infoBoxLabel}>Kcal</Text>
          </View>
        </View>

        <FormDropdown label={'Choose Workout'} value={workout} onChange={setWorkout} options={workoutsList}/>
        <View style={{ marginTop: -10, marginBottom: -20 }}>
          <FormDropdown  value={week} onChange={setWeek} options={[{ label: 'Week 1', value: 'week-1' }, { label: 'Week 2', value: 'week-2' }]} />
        </View>
        <View style={__base.divider} />
        {workoutExercises.map(ex => (
          <PlanCard key={ex.title} title={ex.title} description={ex.subtitle} image={ex.image} onPress={() => setExercise(true) } />
        ))}
        <View style={__base.space} />
        <CustomButton title="Schedule Workout" backgroundColor="#000" borderColor="#FFF" textColor="#FFF" onPress={() =>  alert('Scheduled') } />
        <View style={__base.footerSpace} />
      </View>
    </StickyHeader>
  );
}
