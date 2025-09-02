import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import MultiSelectSection from '~/components/Form/MultiSelectSection';
import WeekDayList from '~/components/Form/WeekDayList';
import FormInput from '~/components/Form/Input';
import FormDropdown from '~/components/Form/Dropdown';

import { experienceOptions, trainingHoursOptions } from '~/data/content/options';

import __base from '~/assets/styles/base';

export default function Level() {
  const navigation = useNavigation<any>();

  const [experiences, setExepriences] = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<string[]>([]);
  const [trainingHours, setTrainingHours] = useState<string[]>([]);

  return (
    <StickyHeader title="Fitness Level">
      <View style={__base.headerWithExtra}>
        <View>
          <IconButton route="Goals" />
          <HeaderText title={'How would you rate '} subtitle="your current fitness level?" />
        </View>
        <HeaderImage image="example" />
      </View>
      <WeekDayList selected={trainingDays} onChange={setTrainingDays} />
      <MultiSelectSection
        title="Workout history"
        options={experienceOptions}
        selected={experiences}
        onChange={setExepriences}
      />
      <FormInput label="Got more to share?" placeholder='Fill in any details that could be relevant' type="text" onChange={() => {}} value={''} required />
      <FormDropdown
        label={'How many hour you willing to train per day?'}
        required
        value={trainingHours+''}
        onChange={setTrainingHours}
        options={trainingHoursOptions}
      />
      <CustomButton
        title="Next"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={() => navigation.navigate('EatingHabits')}
      />
    </StickyHeader>
  );
}
