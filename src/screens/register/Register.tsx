// src/screens/register/Register.tsx
import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import { FormInput, FormCheckbox, FormDatePicker, FormImageUpload, FormDropdown } from '~/components/Form';
import { createAndLoginClient } from '~/data/supabase/authHandler';

import { registerDefault } from '~/data/forms/defaultValues';
import useTranslation from '~/data/helpers/translation';
import { genderOptions } from '~/data/content/options';
import { validateRegister } from '~/data/forms/validationRules';
import { toastError } from '~/data/helpers/toast';

import __base from '~/assets/styles/base';
import Loading from '~/components/Loading';

export default function Register() {
  const navigation = useNavigation<any>();
  const t = useTranslation().register;

  const { control, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: registerDefault,
    mode: 'onBlur',
  });

  const [loading, setLoading] = useState(false);
  const canSubmit = useMemo(() => !isSubmitting && !loading, [isSubmitting, loading]);

  const onSubmit = handleSubmit(
    async (values) => {
      setLoading(true);
      try {
        const { agreed, ...payload } = values as any;
        await createAndLoginClient(payload);
        navigation.navigate('Metrics');
      } catch (e) {
        // Supabase Postgrest errors are plain objects, not Error instances.
        console.log('register failed', JSON.stringify(e), e);
        const err = e as { message?: string; details?: string; hint?: string; code?: string };
        const message =
          [err?.message, err?.details, err?.code && `(${err.code})`].filter(Boolean).join(' ') ||
          'Please try again.';
        toastError(t.errors?.registerFailed ?? 'Registration failed', message);
      } finally {
        setLoading(false);
      }
    },
    () => {
      toastError(
        t.errors?.registerFailed ?? 'Registration failed',
        'Please check all required fields and accept the Terms and Privacy Policy.',
      );
    },
  );

  if(loading){ return <Loading />}

  return (
    <>
      <StickyHeader title={t.screenTitle}>
        <HeaderWithExtra back="Start" title={t.title} subtitle={t.subtitle} hideImage />
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <FormImageUpload
            control={control}
            name="avatarUrl"
            filepath="clients"
            variant="square"
            size={140}
            source="both"
            placeholder="logo"
            label={t.avatar.label}
          />
        </View>
        <FormInput control={control} name="firstName" label={t.firstName.label} placeholder={t.firstName.placeholder} required rules={validateRegister.firstName}/>
        <FormInput control={control} name="lastName"  label={t.lastName.label}  placeholder={t.lastName.placeholder}  required rules={validateRegister.lastName}/>
        <FormDatePicker control={control} name="dob"   label={t.dob.label}      required rules={validateRegister.dob} />
        <FormDropdown control={control} name="gender" label={t.gender.label}   required options={genderOptions} rules={validateRegister.gender} />
        <View style={__base.divider} />
        <Text style={[__base.textBold]}>{t.login.title}</Text>
        <Text style={[__base.textSubline]}>{t.login.subline}</Text>
        <FormInput control={control} name="email"    label={t.email.label}    placeholder={t.email.placeholder}    type="email"    required rules={validateRegister.email} />
        <FormInput control={control} name="password" label={t.password.label} placeholder={t.password.placeholder} type="password" required rules={validateRegister.password} />
        <FormCheckbox control={control} name="agreed" label={t.terms.label} rules={validateRegister.agreed} />
        <CustomButton title={t.cta} backgroundColor="#000" textColor="#FFF" onPress={onSubmit} disabled={!canSubmit} />
      </StickyHeader>
    </>
  );
}
