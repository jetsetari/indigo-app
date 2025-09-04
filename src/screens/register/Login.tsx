// src/screens/register/Login.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BgVideo from '~/components/Layout/BgVideo';

import CustomButton from '~/components/Buttons/CustomButton';
import IconButton from '~/components/Buttons/IconButton';
import FormInput from '~/components/Form/Input';
import Logo from '~/components/Layout/Logo';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { signIn } from '~/data/supabase/authHandler';

import __base from '~/assets/styles/base';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigation = useNavigation<any>();

  const onLogin = async () => {
    if (!email || !password) {
      toastError('Missing details', 'Please enter both your email and password to continue.');
      return;
    }
    try {
      setBusy(true);
      await signIn(email, password);
      toastSuccess('Welcome back 👋','You’re now signed in.');
      navigation.navigate('Home');
    } catch (e: any) {
      console.log(e);
      toastError('Login failed', e?.message ?? 'We couldn’t sign you in. Please check your details and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={__base.container}>
      <BgVideo
        source={require('~/assets/videos/background-4.mp4')}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
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
              <FormInput label="Email" placeholder="john.doe@indigo.la" type="email" onChange={setEmail} value={email} required />
              <FormInput label="Password" placeholder="Your password" type="password" onChange={setPassword} value={password} showStrengthBar={false} required />
              <CustomButton title={busy ? 'Signing in…' : 'Login'} backgroundColor="#FFF" textColor="#000" onPress={onLogin} disabled={busy} />
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
