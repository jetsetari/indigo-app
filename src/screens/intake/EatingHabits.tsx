import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import FormDropdown from '~/components/Form/Dropdown';
import FormInput from '~/components/Form/Input';
import SingleSelectGrid from '~/components/Form/SingleSelectGrid';

import __base from '~/assets/styles/base';

const eatingOptions = [
  { label: 'Balanced Diet', description: 'Omnivore', icon: '🍽️', value: 'balanced' },
  { label: 'Vegetarian', description: 'No meat, but eats animal products', icon: '🥚', value: 'vegetarian' },
  { label: 'Keto', description: 'High fat, low carb', icon: '🌿', value: 'keto' },
  { label: 'Plant Based', description: 'No animal products consumed', icon: '🌾', value: 'plant-based' },
  { label: 'Pescatarian', description: 'Only fish and some animal products', icon: '🐟', value: 'pescatarian' },
  { label: 'Paleo Diet', description: 'High protein & fat, Low gluten & processed foods', icon: '🔥', value: 'paleo' },
];

const mealOptions = [
  { label: '1 Meal', value: '1' },
  { label: '2 Meals', value: '2' },
  { label: '3 Meals', value: '3' },
  { label: '4 Meals', value: '4' },
  { label: '5+ Meals', value: '5' },
];

export default function EatingHabits() {
  const navigation = useNavigation<any>();

  const [selectedStyle, setSelectedStyle] = useState<string>('balanced');
  const [mealCount, setMealCount] = useState<string>('2');
  const [kcal, setKcal] = useState<string>('');

  return (
    <StickyHeader title="Eating Habits">
      <View style={__base.headerWithExtra}>
        <View>
          <IconButton route="Level" />
          <HeaderText title="Eating Habits" subtitle="Tell us about your nutrition" />
        </View>
        <HeaderImage image="example" />
      </View>

      <SingleSelectGrid
        options={eatingOptions}
        selected={selectedStyle}
        onChange={setSelectedStyle}
      />

      <FormDropdown
        label="How often do you eat in a day?"
        value={mealCount}
        onChange={setMealCount}
        options={mealOptions}
      />

      <FormInput
        label="If you know your daily kcal intake?"
        placeholder="Leave blank if you don’t know"
        type="number"
        value={kcal}
        onChange={setKcal}
      />

      <CustomButton
        title="Next"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={() => navigation.navigate('Supplements')}
      />
    </StickyHeader>
  );
}
