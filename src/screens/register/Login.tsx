// src/screens/register/Login.tsx
import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import BgVideo from '~/components/Layout/BgVideo';
import CustomButton from '~/components/Buttons/CustomButton';
import { FormInput } from '~/components/Form';
import Logo from '~/components/Layout/Logo';
import IconButton from '~/components/Buttons/IconButton';

import useTranslation from '~/data/helpers/translation';
import { signInAndGetNext } from '~/data/supabase/authHandler';
import { LoginForm } from '~/data/types';
import { loginDefault } from '~/data/forms/defaultValues';
import { validateLogin } from '~/data/forms/validationRules';

import __base from '~/assets/styles/base';

export default function Login() {
  const navigation = useNavigation<any>();
  const t = useTranslation().login;
  const { control, handleSubmit, formState: { isSubmitting }} = useForm<LoginForm>({
    defaultValues: loginDefault, mode: 'all',
  });

  const onLogin = async ({ email, password }: LoginForm) => {
    try {
      const { next } = await signInAndGetNext(email, password);
      navigation.navigate(next);
    } catch {
      // toast shown in signInAndGetNext
    }
  };

  return (
    <View style={__base.container}>
      <BgVideo source={{ uri: 'https://vimeo.com/1213000669' }} overlayStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}} resizeMode="cover"/>
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
              <Text style={[__base.textBold]}>{t.title}</Text>
              <Text style={[__base.textSubline]}>{t.subline}</Text>
              <FormInput control={control} name="email" label={t.emailLabel} placeholder={t.emailPlaceholder} type="email" required rules={validateLogin.email}/>
              <FormInput control={control} name="password" label={t.passwordLabel} placeholder={t.passwordPlaceholder} type="password" required rules={validateLogin.password}/>
              <CustomButton title={isSubmitting ? t.submitSubmitting : t.submitIdle} backgroundColor="#FFF" textColor="#000" onPress={handleSubmit(onLogin)} disabled={isSubmitting} />
              <View style={__base.space} />
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[__base.footerLink]}>{t.forgotPassword}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
