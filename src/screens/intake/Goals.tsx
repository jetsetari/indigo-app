// src/screens/intake/Goals.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';
import { FormSelectMulti } from '~/components/Form';
import { useRoute } from '@react-navigation/native';

import { useUserStore } from '~/data/store/userStore';
import useTranslation from '~/data/helpers/translation';
import { toastSuccess, toastError } from '~/data/helpers/toast';

import { getAllGoalsOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';
import { updateClient, appendDoneScreen } from '~/data/supabase/clientsHandler';
import { ClientGoalsRow } from '~/data/types';

function toSlugArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

export default function Goals() {
  const navigation = useNavigation<any>();
  const t = useTranslation().goals;
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatarUrl ?? undefined;
  const { params } = useRoute<any>();
  const isSettings = params?.mode === 'settings';

  const [loading, setLoading] = useState(true);
  const [weightOptions, setWeightOptions] = useState<GoalOption[]>([]);
  const [performanceOptions, setPerformanceOptions] = useState<GoalOption[]>([]);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ClientGoalsRow>({
    defaultValues: {
      weightGoals: toSlugArray(client?.weightGoals),
      performanceGoals: toSlugArray(client?.performanceGoals),
      sportGoals: [],
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { weight, performance /*, sport */ } = await getAllGoalsOptions();
        if (!alive) return;
        setWeightOptions(weight);
        setPerformanceOptions(performance);
        // setSportTrainingOptions(sport);
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
        weightGoals: values.weightGoals?.length ? values.weightGoals : null,
        performanceGoals: values.performanceGoals?.length ? values.performanceGoals : null,
        // sportGoals: values.sportGoals?.length ? values.sportGoals : null,
      });

      toastSuccess(t?.savedTitle ?? 'Saved', t?.savedBody ?? 'Your goals have been saved.');
      await appendDoneScreen('goals');
      navigation.navigate('Level');
    } catch (e: any) {
      toastError(t?.saveFailedTitle ?? 'Save failed', e?.message ?? t?.saveFailedBody ?? 'Please try again.');
    }
  }), [navigation, t]);

  if (loading) return <Loading />;

  return (
    <StickyHeader title={t?.screenTitle ?? 'Goals'}>
      <HeaderWithExtra
        back={isSettings ? 'Profile' : 'Metrics'}
        title={"Let’s define your goals"}
        subtitle={t?.header.subtitle ?? 'Choose what applies.'}
        image={avatarUrl}
      />

      <FormSelectMulti
        control={control}
        name="weightGoals"
        title={t?.sections?.weight ?? 'Weight Goals'}
        icon="💪"
        options={weightOptions}
      />

      <FormSelectMulti
        control={control}
        name="performanceGoals"
        title={t?.sections?.performance ?? 'Performance'}
        icon="🔥"
        options={performanceOptions}
      />

      {/* Sport-specific goals — temporarily removed
      <FormSelectMulti
        control={control}
        name="sportGoals"
        title={t?.sections?.sport ?? 'Sport specific training'}
        icon="🏃‍♂️"
        options={sportTrainingOptions}
      />
      */}

      <CustomButton
        title={isSubmitting ? (t?.ctaSaving ?? 'Saving…') : (t?.ctaNext ?? 'Next')}
        backgroundColor="#000"
        textColor="#FFF"
        onPress={onSubmit}
        disabled={isSubmitting}
      />
    </StickyHeader>
  );
}
