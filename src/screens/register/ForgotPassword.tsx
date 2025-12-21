import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import BgVideo from '~/components/Layout/BgVideo';
import CustomButton from '~/components/Buttons/CustomButton';
import { FormInput } from '~/components/Form';
import IconButton from '~/components/Buttons/IconButton';
import Logo from '~/components/Layout/Logo';

import useTranslation from '~/data/helpers/translation';
import { resetPassword } from '~/data/supabase/authHandler';
import { validateLogin } from '~/data/forms/validationRules';

import __base from '~/assets/styles/base';

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPassword() {
  const navigation = useNavigation<any>();
  const t = useTranslation().login;
  const { control, handleSubmit, formState: { isSubmitting }} = useForm<ForgotPasswordForm>({
    defaultValues: { email: '' },
    mode: 'all',
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    try {
      await resetPassword(email);
      // Optionally navigate back to login after showing success
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (e: any) {
      console.log(e);
      // Error is already handled in resetPassword with toast
    }
  };

  return (
    <View style={__base.container}>
      <BgVideo source={{ uri: 'https://vimeo.com/1136752791' }} overlayStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}} resizeMode="cover"/>
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
                Don't worry — we'll help you get back on track in no time.
              </Text>
              <FormInput 
                control={control} 
                name="email" 
                label={t.emailLabel} 
                placeholder={t.emailPlaceholder} 
                type="email" 
                required 
                rules={validateLogin.email}
              />
              <CustomButton 
                title={isSubmitting ? 'Sending...' : 'Recover Password'} 
                backgroundColor="#FFF" 
                textColor="#000" 
                onPress={handleSubmit(onSubmit)} 
                disabled={isSubmitting} 
              />
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
