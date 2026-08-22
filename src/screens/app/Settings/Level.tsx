import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormHorizontalPicker, FormSelectMulti, FormInput } from '~/components/Form';
import { getLevelOptions, type ExperienceOption } from '~/data/supabase/optionsDataHandler';
import { updateClient } from '~/data/supabase/clientsHandler';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { useUserStore } from '~/data/store/userStore';
import CustomButton from '~/components/Buttons/CustomButton';

type Values = {
  sessionsPerWeek: number;
  experienceSlugs: string[];
  notes: string;
};

export default function LevelSettings() {
  const c = useUserStore((s) => s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      sessionsPerWeek: Number(c?.sessionsPerWeek ?? 3),
      experienceSlugs: c?.groupExperience ?? [],
      notes: c?.notes ?? '',
    },
    mode: 'onSubmit',
  });

  const [experience, setExperience] = useState<ExperienceOption[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await getLevelOptions();
        setExperience(r.experience);
      } catch {
        toastError('Error', 'Failed to load options.');
      }
    })();
  }, []);

  const onSubmit = useCallback(handleSubmit(async (v) => {
    try {
      await updateClient({
        sessionsPerWeek: v.sessionsPerWeek ?? null,
        groupExperience: v.experienceSlugs?.length ? v.experienceSlugs : null,
        notes: v.notes?.trim() || null,
      });
      toastSuccess('Saved', 'Level updated.');
    } catch (e: any) {
      toastError('Save failed', e?.message || 'Try again.');
    }
  }), [handleSubmit]);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormHorizontalPicker
        control={control}
        name="sessionsPerWeek"
        label="How many days do you train?"
        min={1}
        max={7}
        unit="days"
      />
      <FormSelectMulti control={control} name="experienceSlugs" title="Experience" options={experience} />
      <FormInput control={control} name="notes" label="Notes" type="text" />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
