import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import Toggle from '~/components/Form/Toggle';
import FormDropdown from '~/components/Form/Dropdown';
import FormInput from '~/components/Form/Input';
import HorizontalPicker from '~/components/Form/HorizontalPicker';

import __base from '~/assets/styles/base';

export default function Register() {
  const navigation = useNavigation<any>();

  const [metric, setMetric] = useState<'lbs/inches' | 'kg/cm'>('kg/cm');
  const [weight, setWeight] = useState(70); // default kg
  const [height, setHeight] = useState<number | string>('170'); // default cm

  // Dynamically generate height options
  const heightOptions = useMemo(() => {
    if (metric === 'kg/cm') {
      return Array.from({ length: 101 }, (_, i) => {
        const cm = 140 + i;
        return { label: `${cm} cm`, value: `${cm}` };
      });
    } else {
      return Array.from({ length: 61 }, (_, i) => {
        const inch = 48 + i; // 4'0" = 48 inches
        return { label: `${inch} in`, value: `${inch}` };
      });
    }
  }, [metric]);

  return (
    <StickyHeader title="Measurements">
      <View style={__base.headerWithExtra}>
        <View>
          <IconButton route="Register" />
          <HeaderText
            title={'Hi Mike,'}
            subtitle={`Let's see where you're at, \nso we know where to go`}
          />
        </View>
        <HeaderImage image="example" />
      </View>

      <Toggle
        options={['lbs/inches', 'kg/cm']}
        selected={metric}
        onChange={(value) => setMetric(value as 'lbs/inches' | 'kg/cm')}
      />

      <HorizontalPicker
        label={`What’s your current weight?`}
        value={weight}
        onChange={setWeight}
        unit={metric === 'kg/cm' ? 'kg' : 'lbs'}
        min={metric === 'kg/cm' ? 40 : 90}
        max={metric === 'kg/cm' ? 200 : 400}
      />
      <View>
        <FormInput label="What’s your goal weight?" placeholder="Goal" type="text" onChange={() => {}} value={''} required/>
      </View>
      <FormDropdown
        label={'How tall are you?'}
        required
        value={height+''}
        onChange={setHeight}
        options={heightOptions}
      />

      <View style={__base.rowGap}>
        <FormInput
          label="Your fat percentage"
          placeholder="%"
          type="text"
          onChange={() => {}}
          value={''}
          required
        />
        <View style={{ marginBottom: 15 }}>
          <CustomButton
            title="Calculate"
            backgroundColor="#000"
            textColor="#FFF"
            onPress={() => navigation.navigate('MeasurementsFat')}
          />
        </View>
      </View>

      <CustomButton
        title="Next"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={() => navigation.navigate('Goals')}
      />
    </StickyHeader>
  );
}
