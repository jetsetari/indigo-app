import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormSelectGrid, FormDropdown, FormInput } from '~/components/Form';
import { useUserStore } from '~/data/store/userStore';
import { updateClient } from '~/data/supabase/clientsHandler';
import { toastSuccess, toastError } from '~/data/helpers/toast';
import { eatingOptions, mealOptions } from '~/data/content/options';
import CustomButton from '~/components/Buttons/CustomButton';

type Values = { eatingHabits: string; mealsPerDay: number|''; dailyKcalIntake: number|''; };

export default function EatingHabbitsSettings() {
  const c = useUserStore(s=>s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      eatingHabits: c?.eatingHabits || '',
      mealsPerDay:  (c?.mealsPerDay ?? '') as any,
      dailyKcalIntake: (c?.dailyKcalIntake ?? '') as any,
    },
    mode: 'onSubmit',
  });

  const onSubmit = useCallback(handleSubmit(async v => {
    try {
      await updateClient({
        eatingHabits: v.eatingHabits || null,
        mealsPerDay:  v.mealsPerDay === '' ? null : Number(v.mealsPerDay),
        dailyKcalIntake: v.dailyKcalIntake === '' ? null : Number(v.dailyKcalIntake),
      });
      toastSuccess('Saved','Eating habits updated.');
    } catch(e:any){ toastError('Save failed', e?.message || 'Try again.'); }
  }), []);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormSelectGrid control={control} name="eatingHabits" label="Your eating style" options={eatingOptions} />
      <FormDropdown control={control} name="mealsPerDay" label="Meals per day" options={mealOptions} parseAsNumber />
      <FormInput control={control} name="dailyKcalIntake" label="Daily kcal (optional)" type="number" />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
