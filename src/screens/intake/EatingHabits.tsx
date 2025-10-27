// src/screens/intake/EatingHabits.tsx
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';

import { FormSelectGrid, FormDropdown, FormInput } from '~/components/Form';

import { useUserStore } from '~/data/store/userStore';
import useTranslation from '~/data/helpers/translation';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updateClient, appendDoneScreen } from '~/data/supabase/clientsHandler';
import { useRoute } from '@react-navigation/native';

import { eatingOptions, mealOptions } from '~/data/content/options'; // keep existing options
import __base from '~/assets/styles/base';

// Form values (camelCase to match our app-side convention)
type FormValues = {
  eatingHabits: string;            // single slug
  mealsPerDay: number | '' ;       // dropdown -> number
  dailyKcalIntake: number | '' ;   // optional number input
};

// Defaults (can be moved to src/data/forms/defaultValues.ts)
const defaultValues: FormValues = {
  eatingHabits: '',
  mealsPerDay: '' as const,
  dailyKcalIntake: '' as const,
};

export default function EatingHabits() {
  const navigation = useNavigation<any>();
  const t = (useTranslation() as any).eatingHabits ?? {};
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatarUrl ?? undefined;
  const { params } = useRoute<any>();
  const isSettings = params?.mode === 'settings';

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues,
    mode: 'onSubmit',
  });

  const [saving, setSaving] = useState(false);

  const onSubmit = useCallback(handleSubmit(async (values) => {
    try {
      setSaving(true);

      await updateClient({
        eatingHabits: values.eatingHabits || null,
        mealsPerDay: values.mealsPerDay === '' ? null : Number(values.mealsPerDay),
        dailyKcalIntake: values.dailyKcalIntake === '' ? null : Number(values.dailyKcalIntake),
      });

      toastSuccess(t.savedTitle ?? 'Saved', t.savedBody ?? 'Your eating habits have been saved.');
      if (isSettings) { 
        navigation.goBack(); 
      } else {
        await appendDoneScreen('eatinghabbits');
        navigation.navigate('Supplements');
      }
      
      //
    } catch (e: any) {
      toastError(t.saveFailedTitle ?? 'Save failed', e?.message ?? (t.saveFailedBody ?? 'Please try again.'));
    } finally {
      setSaving(false);
    }
  }), [navigation, t]);

  if (saving) return <Loading />;

  return (
    <StickyHeader title={t.screenTitle ?? 'Eating Habits'}>
      <HeaderWithExtra
        //back={isSettings ? 'Profile' : 'Level'}
        title={t.header?.title ?? 'Eating Habits'}
        subtitle={t.header?.subtitle ?? 'Tell us about your nutrition'}
        image={avatarUrl}
      />

      {/* Eating style (single select grid → text) */}
      <FormSelectGrid
        control={control}
        name="eatingHabits"
        label={t.sections?.eating ?? 'Your eating style'}
        required
        rules={[{ type: 'required', message: t.errors?.eatingRequired ?? 'Pick one option' }]}
        options={eatingOptions /* [{label, description, icon, value}] or adapt to {label, value} if using the simpler variant */}
      />

      {/* Meals per day (dropdown → number) */}
      <FormDropdown
        control={control}
        name="mealsPerDay"
        label={t.mealsPerDay?.label ?? 'How often do you eat in a day?'}
        options={mealOptions /* array of {label,value:number} */}
        parseAsNumber
        rules={[{ type: 'required', message: t.mealsPerDay?.required ?? 'Please choose one' }]}
      />

      {/* Daily kcal intake (optional number) */}
      <FormInput
        control={control}
        name="dailyKcalIntake"
        label={t.kcal?.label ?? 'If you know your daily kcal intake'}
        placeholder={t.kcal?.placeholder ?? 'Leave blank if you don’t know'}
        type="number"
        rules={[
          { type: 'regex', value: /^\d+$/, message: t.kcal?.invalid ?? 'Please enter a whole number' },
        ]}
      />

      <CustomButton
        title={isSubmitting ? (t.ctaSaving ?? 'Saving…') : (t.ctaNext ?? 'Next')}
        backgroundColor="#000"
        textColor="#FFF"
        onPress={onSubmit}
        disabled={isSubmitting}
      />
    </StickyHeader>
  );
}
