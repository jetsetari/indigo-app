import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';

import { FormHorizontalPicker, FormSelectMulti, FormInput } from '~/components/Form';
import { useRoute } from '@react-navigation/native';

import { useUserStore } from '~/data/store/userStore';
import useTranslation from '~/data/helpers/translation';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updateClient, appendDoneScreen } from '~/data/supabase/clientsHandler';
import { getLevelOptions, type ExperienceOption } from '~/data/supabase/optionsDataHandler';

type FormValues = {
  sessionsPerWeek: number;
  experienceSlugs: string[];
  notes: string;
};

const defaultValues: FormValues = {
  sessionsPerWeek: 3,
  experienceSlugs: [],
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
    defaultValues: {
      ...defaultValues,
      sessionsPerWeek: Number(client?.sessionsPerWeek ?? defaultValues.sessionsPerWeek),
    },
    mode: 'onSubmit',
  });

  const [loading, setLoading] = useState(true);
  const [experienceOptions, setExperienceOptions] = useState<ExperienceOption[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { experience } = await getLevelOptions();
        if (!alive) return;
        setExperienceOptions(experience);
      } catch (e) {
        toastError(t?.loadErrorTitle ?? 'Error', t?.loadErrorBody ?? 'Failed to load options.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [t]);

  const onSubmit = useCallback(handleSubmit(async (values) => {
    try {
      await updateClient({
        sessionsPerWeek: values.sessionsPerWeek ?? null,
        groupExperience: values.experienceSlugs?.length ? values.experienceSlugs : null,
        notes: values.notes?.trim() || null,
      });

      toastSuccess(t?.savedTitle ?? 'Saved', t?.savedBody ?? 'Your level has been saved.');
      await appendDoneScreen('level');
      navigation.navigate('Home');
    } catch (e: any) {
      toastError(t?.saveFailedTitle ?? 'Save failed', e?.message ?? t?.saveFailedBody ?? 'Please try again.');
    }
  }), [navigation, t]);

  if (loading) return <Loading />;

  return (
    <StickyHeader title={t?.screenTitle ?? 'Fitness Level'}>
      <HeaderWithExtra
        back={isSettings ? 'Profile' : 'Goals'}
        title={t?.title ?? 'How would you rate'}
        subtitle={t?.subtitle ?? 'your current fitness level?'}
        image={avatarUrl}
      />

      <FormHorizontalPicker
        control={control}
        name="sessionsPerWeek"
        label={t?.trainingDays?.label ?? 'How many days do you train?'}
        min={1}
        max={7}
        unit="days"
      />

      <FormSelectMulti
        control={control}
        name="experienceSlugs"
        title={t?.experience?.label ?? 'Experience'}
        icon="👥"
        options={experienceOptions}
      />

      <FormInput
        control={control}
        name="notes"
        label={t?.notes?.label ?? 'Got more to share?'}
        placeholder={t?.notes?.placeholder ?? 'Fill in any details that could be relevant'}
        type="text"
      />

      <CustomButton title={t?.ctaNext ?? 'Next'} backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </StickyHeader>
  );
}
