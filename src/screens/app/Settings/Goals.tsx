import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormSelectMulti, FormSelectSingle } from '~/components/Form';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updateClient } from '~/data/supabase/clientsHandler';
import { getAllGoalsOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';
import { useUserStore } from '~/data/store/userStore';
import CustomButton from '~/components/Buttons/CustomButton';

type Values = { weightGoals: string | null; performanceGoals: string[]; sportGoals: string[] | null; };

export default function GoalsSettings() {
  const c = useUserStore(s=>s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      weightGoals: Array.isArray(c?.weightGoals) ? (c.weightGoals[0] ?? null) : c?.weightGoals ?? null,
      performanceGoals: c?.performanceGoals ?? [],
      sportGoals: null, // c?.sportGoals ?? [],
    },
    mode: 'onSubmit',
  });

  const [weight, setWeight] = useState<GoalOption[]>([]);
  const [performance, setPerformance] = useState<GoalOption[]>([]);
  // const [sport, setSport] = useState<GoalOption[]>([]);

  useEffect(() => {
    (async () => {
      try { 
        const o = await getAllGoalsOptions(); 
        setWeight(o.weight); 
        setPerformance(o.performance); 
        // setSport(o.sport); 
      }
      catch { toastError('Error','Failed to load options.'); }
    })();
  }, []);

  const onSubmit = useCallback(handleSubmit(async v => {
    try {
      await updateClient({
        weightGoals: v.weightGoals ? [v.weightGoals] : null,
        performanceGoals: v.performanceGoals?.length ? v.performanceGoals : null,
        sportGoals: null, // v.sportGoals?.length ? v.sportGoals : null,
      });
      toastSuccess('Saved', 'Goals updated.');
    } catch (e:any) { toastError('Save failed', e?.message || 'Try again.'); }
  }), []);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormSelectSingle control={control} name="weightGoals" title="Weight Goals" icon="💪" options={weight} />
      <FormSelectMulti control={control} name="performanceGoals" title="Performance" icon="🔥" options={performance} />
      {/* <FormSelectMulti control={control} name="sportGoals" title="Sport specific training" icon="🏃‍♂️" options={sport} /> */}
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
