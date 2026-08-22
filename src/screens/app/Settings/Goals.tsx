import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormSelectMulti } from '~/components/Form';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updateClient } from '~/data/supabase/clientsHandler';
import { getAllGoalsOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';
import { useUserStore } from '~/data/store/userStore';
import CustomButton from '~/components/Buttons/CustomButton';

type Values = {
  weightGoals: string[];
  performanceGoals: string[];
  sportGoals: string[];
};

function toSlugArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

export default function GoalsSettings() {
  const c = useUserStore((s) => s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      weightGoals: toSlugArray(c?.weightGoals),
      performanceGoals: toSlugArray(c?.performanceGoals),
      sportGoals: [],
    },
    mode: 'onSubmit',
  });

  const [weight, setWeight] = useState<GoalOption[]>([]);
  const [performance, setPerformance] = useState<GoalOption[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const o = await getAllGoalsOptions();
        setWeight(o.weight);
        setPerformance(o.performance);
      } catch {
        toastError('Error', 'Failed to load options.');
      }
    })();
  }, []);

  const onSubmit = useCallback(handleSubmit(async (v) => {
    try {
      await updateClient({
        weightGoals: v.weightGoals?.length ? v.weightGoals : null,
        performanceGoals: v.performanceGoals?.length ? v.performanceGoals : null,
        sportGoals: null,
      });
      toastSuccess('Saved', 'Goals updated.');
    } catch (e: any) {
      toastError('Save failed', e?.message || 'Try again.');
    }
  }), [handleSubmit]);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormSelectMulti
        control={control}
        name="weightGoals"
        title="Weight Goals"
        icon="💪"
        options={weight}
      />
      <FormSelectMulti
        control={control}
        name="performanceGoals"
        title="Performance"
        icon="🔥"
        options={performance}
      />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
