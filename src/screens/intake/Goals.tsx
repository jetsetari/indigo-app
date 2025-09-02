import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import MultiSelectSection from '~/components/Form/MultiSelectSection';

import { sportTrainingOptions, performanceOptions, weightOptions } from '~/data/content/options';

import __base from '~/assets/styles/base';

export default function Goals() {
  const navigation = useNavigation<any>();

  const [weightGoals, setWeightGoals] = useState<string[]>([]);
  const [performanceGoals, setPerformanceGoals] = useState<string[]>([]);
  const [sportGoals, setSportGoals] = useState<string[]>([]);

  return (
    <StickyHeader title="Goals">
      <View style={__base.headerWithExtra}>
        <View>
          <IconButton route="Measurements" />
          <HeaderText title={'Let’s define your goals'} subtitle="Choose what that applies." />
        </View>
        <HeaderImage image="example" />
      </View>

      <MultiSelectSection
        icon="💪"
        title="Weight Goals"
        options={weightOptions}
        selected={weightGoals}
        onChange={setWeightGoals}
      />

      <MultiSelectSection
        icon="🔥"
        title="Performance"
        options={performanceOptions}
        selected={performanceGoals}
        onChange={setPerformanceGoals}
      />

      <MultiSelectSection
        icon="🏃‍♂️"
        title="Sport specific training"
        options={sportTrainingOptions}
        selected={sportGoals}
        onChange={setSportGoals}
      />

      <CustomButton
        title="Next"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={() => navigation.navigate('Level')}
      />
    </StickyHeader>
  );
}
