import React, { useState, useMemo } from 'react';
import { View, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import Toggle from '~/components/Form/Toggle';
import HorizontalPicker from '~/components/Form/HorizontalPicker';
import AIPhotoCapture from '~/components/Layout/AIPhotoCapture';

import __base from '~/assets/styles/base';
const example = require('~/assets/images/dummy/bodyfat.jpg');

export default function Register() {
  const navigation = useNavigation<any>();

  const [option, setOption] = useState<'Manual' | 'AI'>('Manual');
  const [percentage, setPercentage] = useState(20); // default kg

  return (
    <StickyHeader title="Bodyfat">
      <View style={__base.headerWithExtra}>
        <View>
          <HeaderText
            title={'Calculate your bodyfat'}
            subtitle={`Let’s do the maths`}
          />
        </View>
        <View style={{ marginLeft: 'auto' }}>
          <IconButton route="Measurements" icon="close" />
        </View>
      </View>
      <Toggle options={['Manual', 'AI']} selected={option} onChange={(value) => setOption(value as 'Manual' | 'AI')} />
      { (option === 'Manual') ? (
          <>
            <Image source={example} style={{ width: '100%', height: 350 }} resizeMode="contain" />
            <HorizontalPicker value={percentage} onChange={setPercentage} unit={'%'} min={6} max={100} />
          </>
        ):(
          <AIPhotoCapture onComplete={(images) => console.log('All photos:', images)} />
        )
      }
      <CustomButton title={ (option === 'Manual') ? 'Accept': 'Calculate' } backgroundColor="#000" textColor="#FFF" onPress={() => navigation.navigate('Measurements')} />
    </StickyHeader>
  );
}
