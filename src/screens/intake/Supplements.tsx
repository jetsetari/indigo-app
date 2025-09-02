import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import MultiSelectSection from '~/components/Form/MultiSelectSection';


import { supplementOptions } from '~/data/content/options';



import __base from '~/assets/styles/base';

export default function Level() {
  const navigation = useNavigation<any>();

  const [supplements, setSupplements] = useState<string[]>([]);

  return (
    <StickyHeader title="Supplements">
      <View style={__base.headerWithExtra}>
        <View>
          <IconButton route="EatingHabits" />
          <HeaderText title={'Supplements'} subtitle="List of supplements" />
        </View>
        <HeaderImage image="example" />
      </View>
      <MultiSelectSection
        title="Do you take any supplements?"
        options={supplementOptions}
        selected={supplements}
        onChange={setSupplements}
      />
      <CustomButton
        title="Next"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={() => navigation.navigate('Payment')}
      />
    </StickyHeader>
  );
}
