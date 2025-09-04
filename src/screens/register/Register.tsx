// src/screens/register/Register.tsx
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import { RHFImageUpload, RHFInput, RHFDatePicker, RHFCheckbox, RHFDropdown } from '~/components/Form';

import defaultValues from '~/data/forms/register/defaultValues';
import useTranslation from '~/data/helpers/translation';
import { registrationSchema, type RegistrationForm } from '~/data/forms/register/validation';
import { buildSubmit, handleInvalid } from '~/data/forms/register/submit';
import { genderOptions } from '~/data/content/options';

import __base from '~/assets/styles/base';

export default function Register() {
  const navigation = useNavigation<any>();
  const t = useTranslation().register;

  const { control, handleSubmit, formState: { isSubmitting } } =
  useForm<RegistrationForm, any, RegistrationForm>({
    resolver: zodResolver<RegistrationForm, any, RegistrationForm>(registrationSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const canSubmit = useMemo(() => !isSubmitting, [isSubmitting]);

  const onSubmit = handleSubmit(
    buildSubmit({ navigation, t, language: 'en', onSuccessNavigateTo: 'Metrics' }),
    handleInvalid(t)
  );

  return (
    <StickyHeader title={t.screenTitle}>
      <HeaderWithExtra back="Start" title={t.title} subtitle={t.subtitle}>
        <RHFImageUpload control={control} name="avatar_url" filepath="users" variant="square" size={75} source="both" />
      </HeaderWithExtra>

      <RHFInput control={control} name="firstName" label={t.firstName.label} placeholder={t.firstName.placeholder} required />
      <RHFInput control={control} name="lastName"  label={t.lastName.label}  placeholder={t.lastName.placeholder}  required />
      <RHFDatePicker control={control} name="dob"  label={t.dob.label} required />
      <RHFDropdown control={control} name="gender" label={t.gender.label} required options={genderOptions}/>

      <View style={__base.divider} />

      <Text style={[__base.textBold]}>{t.login.title}</Text>
      <Text style={[__base.textSubline]}>{t.login.subline}</Text>

      <RHFInput control={control} name="email"    label={t.email.label}    placeholder={t.email.placeholder}    type="email"    required />
      <RHFInput control={control} name="password" label={t.password.label} placeholder={t.password.placeholder} type="password" required  />

      <RHFCheckbox control={control} name="agreed" label={t.terms.label} onPressLink={() => { /* open terms */ }} />

      <CustomButton title={t.cta} backgroundColor="#000" textColor="#FFF" onPress={onSubmit} disabled={!canSubmit} />
    </StickyHeader>
  );
}
