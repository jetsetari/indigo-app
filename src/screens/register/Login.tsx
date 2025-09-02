import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import FormInput from '~/components/Form/Input';
import Logo from '~/components/Layout/Logo';

import __base from '~/assets/styles/base';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();

  return (
    <View style={__base.container}>
      <Video
        source={require('~/assets/videos/background-2.mp4')}
        style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
        isMuted
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={__base.contentCenterTop}>
            <IconButton route="Start" />
          </View>

          <View style={__base.contentCenter}>
            <View style={__base.contentCenterLogo}>
              <Logo />
            </View>
            <View style={__base.contentCenterBottom}>
              <View style={__base.divider} />
              <Text style={[__base.textBold]}>Welcome Back</Text>
              <Text style={[__base.textSubline]}>
                Let’s pick up where you left off {"\n"}— your goals are waiting.
              </Text>

              <FormInput label="Email" placeholder='john.doe@indigo.la' type="email" onChange={setEmail} value={email} required />
              <FormInput label="Password" placeholder='Your password' type="password" onChange={setPassword} value={password} showStrengthBar={false} required/>
              <CustomButton title="Login" backgroundColor="#FFF" textColor="#000" onPress={() => navigation.navigate('Home')} />
              <View style={__base.space} />
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[__base.footerLink]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
