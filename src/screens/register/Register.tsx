import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import FormInput from '~/components/Form/Input';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import FormDatePicker from '~/components/Form/DatePicker';
import Checkbox from '~/components/Form/Checkbox';

import __base from '~/assets/styles/base';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [agreed, setAgreed] = useState(false);
  const navigation = useNavigation<any>();

  return (
    <StickyHeader title="Register">
      <View style={__base.headerWithExtra}>
        <View>
          <IconButton route="Start" />
          <HeaderText title={'Tell us about yourself'} subtitle="Let’s kick things off" />
        </View>
        <HeaderImage />
      </View>
      <FormInput label="First Name" placeholder='Your legendary first name here' type="text" onChange={() => {}} value={''} required />
      <FormInput label="Last Name" placeholder='The last name your gym buddies yell' type="text" onChange={() => {}} value={''} required />
      <FormDatePicker label="Date of Birth" value={dob} onChange={setDob} required />
      <View style={__base.divider} />
      <Text style={[__base.textBold]}>Login Details</Text>
      <Text style={[__base.textSubline]}>
        Secure your account with a strong email and password
      </Text>
      <FormInput label="Email" placeholder='john.doe@indigo.la' type="email" onChange={setEmail} value={email} required />
      <FormInput label="Password" placeholder='Your password' type="password" onChange={setPassword} value={password} showStrengthBar={false} required/>
      <Checkbox value={agreed} onChange={setAgreed} label="I agree with Terms and Privacy Policy" onPressLink={() => { console.log('Terms pressed'); }}/>
      <CustomButton title="Create Account" backgroundColor="#000" textColor="#FFF" onPress={() => navigation.navigate('Measurements') }/>
    </StickyHeader>
  );
}
