import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';

import { FormWeekDayList, FormSelectMulti, FormInput, FormDropdown } from '~/components/Form';
import { useRoute } from '@react-navigation/native';

import { useUserStore } from '~/data/store/userStore';
import useTranslation from '~/data/helpers/translation';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updateClient, appendDoneScreen } from '~/data/supabase/clientsHandler';
import { getLevelOptions, type ExperienceOption, type HoursOption } from '~/data/supabase/optionsDataHandler';

import __base from '~/assets/styles/base';

type FormValues = {
  trainingDays: string[];          // ["MO","TU", ...]
  experienceSlugs: string[];       // group_experience[]
  trainingHistory: string;         // training_history (single)
  trainingHours: number;           // 0.5 .. 5 (step 0.5)
  notes: string;
};

const defaultValues: FormValues = {
  trainingDays: [],
  experienceSlugs: [],
  trainingHistory: '',
  trainingHours: 1,
  notes: '',
};

export default function Level() {
  const navigation = useNavigation<any>();
  const t = useTranslation().level ?? {};
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatarUrl ?? undefined;
  const { params } = useRoute<any>();
  const isSettings = params?.mode === 'settings';

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues,
    mode: 'onSubmit',
  });

  const [loading, setLoading] = useState(true);
  const [experienceOptions, setExperienceOptions] = useState<ExperienceOption[]>([]);
  const [trainingHistoryOptions, setTrainingHistoryOptions] = useState<ExperienceOption[]>([]);
  const [trainingHoursOptions, setTrainingHoursOptions] = useState<HoursOption[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { experience, history, hours } = await getLevelOptions();
        if (!alive) return;
        setExperienceOptions(experience);
        setTrainingHistoryOptions(history);
        setTrainingHoursOptions(hours);
      } catch (e) {
        toastError(t?.loadErrorTitle ?? 'Error', t?.loadErrorBody ?? 'Failed to load options.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [t]);

  const hourDropdown = useMemo(
    () => trainingHoursOptions.map(o => ({ label: o.label, value: o.value })),
    [trainingHoursOptions]
  );
  const historyDropdown = useMemo(
    () => trainingHistoryOptions.map(o => ({ label: o.label, value: o.slug })),
    [trainingHistoryOptions]
  );

  const onSubmit = useCallback(handleSubmit(async (values) => {
    try {
      await updateClient({
        trainingDays: values.trainingDays?.length ? values.trainingDays : null,
        groupExperience: values.experienceSlugs?.length ? values.experienceSlugs : null,
        trainingExperience: values.trainingHistory || null,
        trainingHours: values.trainingHours ?? null,
        notes: values.notes?.trim() || null,
      });

      toastSuccess(t?.savedTitle ?? 'Saved', t?.savedBody ?? 'Your level has been saved.');
      await appendDoneScreen('level');
      navigation.navigate('EatingHabits');
    } catch (e: any) {
      toastError(t?.saveFailedTitle ?? 'Save failed', e?.message ?? t?.saveFailedBody ?? 'Please try again.');
    }
  }), [navigation, t]);

  if (loading) return <Loading />;

  return (
    <StickyHeader title={t?.screenTitle ?? 'Fitness Level'}>
      <HeaderWithExtra
        //back={isSettings ? 'Profile' : 'Goals'}
        title={t?.title ?? 'How would you rate'}
        subtitle={t?.subtitle ?? 'your current fitness level?'}
        image={avatarUrl}
      />

      {/* Training days (array of day codes) */}
      <FormWeekDayList
        control={control}
        name="trainingDays"
        label={t?.trainingDays?.label ?? 'Which days can you train?'}
        // Add rules if you want: rules={{ validate: v => (Array.isArray(v) && v.length) || 'Pick at least one day' }}
      />

      {/* Group experience (multi-select -> text[] in clients) */}
      <FormSelectMulti
        control={control}
        name="experienceSlugs"
        title={t?.experience?.label ?? 'Experience'}
        icon="👥"
        options={experienceOptions} // { label, slug }
      />

      {/* Notes */}
      <FormInput
        control={control}
        name="notes"
        label={t?.notes?.label ?? 'Got more to share?'}
        placeholder={t?.notes?.placeholder ?? 'Fill in any details that could be relevant'}
        type="text"
      />

      {/* Training history (single) */}
      <FormDropdown
        control={control}
        name="trainingHistory"
        label={t?.trainingHistory?.label ?? 'What describes your training history?'}
        options={historyDropdown}
        rules={[
          { type: 'required', message: t?.trainingHistory?.required ?? 'Please choose one option' },
        ]}
      />

      {/* Training hours (0.5 .. 5 in 0.5 steps) */}
      <FormDropdown
        control={control}
        name="trainingHours"
        label={t?.trainingHours?.label ?? 'How many hours are you willing to train per day?'}
        options={hourDropdown}
        parseAsNumber
        rules={[
          { type: 'required', message: t?.trainingHours?.required ?? 'Please choose hours' },
        ]}
      />

      <CustomButton title={t?.ctaNext ?? 'Next'} backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </StickyHeader>
  );
}
