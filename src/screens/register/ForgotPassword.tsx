import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import FormInput from '~/components/Form/Input';
import Logo from '~/components/Layout/Logo';
import BgVideo from '~/components/Layout/BgVideo';

import __base from '~/assets/styles/base';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<any>();

  return (
    <View style={__base.container}>
      <BgVideo source={require('~/assets/videos/background-4.mp4')} overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.7)' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={__base.contentCenterTop}>
            <IconButton route="Login" />
          </View>
          <View style={__base.contentCenter}>
            <View style={__base.contentCenterLogo}>
              <Logo />
            </View>
            <View style={__base.contentCenterBottom}>
              <View style={__base.divider} />
              <Text style={[__base.textBold]}>Reset Your Password</Text>
              <Text style={[__base.textSubline]}>
                Don’t worry — we’ll help you get back on track in no time.
              </Text>
              <FormInput label="Email" type="email" onChange={setEmail} value={email} required />
              <CustomButton title="Recover Password" backgroundColor="#FFF" textColor="#000" onPress={() => {   console.log('Button pressed!'); }} />
              <View style={__base.space} />
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[__base.footerLink]}>Remember again? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
