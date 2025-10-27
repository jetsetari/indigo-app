import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormWeekDayList, FormSelectMulti, FormInput, FormDropdown } from '~/components/Form';
import { getLevelOptions, type ExperienceOption, type HoursOption } from '~/data/supabase/optionsDataHandler';
import { updateClient } from '~/data/supabase/clientsHandler';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { useUserStore } from '~/data/store/userStore';
import CustomButton from '~/components/Buttons/CustomButton';

type Values = {
  trainingDays: string[];
  experienceSlugs: string[];
  trainingHistory: string;
  trainingHours: number;
  notes: string;
};

export default function LevelSettings() {
  const c = useUserStore(s=>s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      trainingDays: c?.trainingDays ?? [],
      experienceSlugs: c?.groupExperience ?? [],
      trainingHistory: c?.trainingExperience ?? '',
      trainingHours: Number(c?.trainingHours ?? 1),
      notes: c?.notes ?? '',
    },
    mode: 'onSubmit',
  });

  const [experience, setExperience] = useState<ExperienceOption[]>([]);
  const [history, setHistory] = useState<ExperienceOption[]>([]);
  const [hours, setHours] = useState<HoursOption[]>([]);

  useEffect(() => { (async () => {
    try { const r = await getLevelOptions(); setExperience(r.experience); setHistory(r.history); setHours(r.hours); }
    catch { toastError('Error','Failed to load options.'); }
  })(); }, []);

  const hourDropdown = useMemo(() => hours.map(o=>({label:o.label,value:o.value})), [hours]);
  const historyDropdown = useMemo(() => history.map(o=>({label:o.label,value:o.slug})), [history]);

  const onSubmit = useCallback(handleSubmit(async v => {
    try {
      await updateClient({
        trainingDays: v.trainingDays?.length ? v.trainingDays : null,
        groupExperience: v.experienceSlugs?.length ? v.experienceSlugs : null,
        trainingExperience: v.trainingHistory || null,
        trainingHours: v.trainingHours ?? null,
        notes: v.notes?.trim() || null,
      });
      toastSuccess('Saved','Level updated.');
    } catch (e:any){ toastError('Save failed', e?.message || 'Try again.'); }
  }), []);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormWeekDayList control={control} name="trainingDays" label="Training days" />
      <FormSelectMulti control={control} name="experienceSlugs" title="Experience" options={experience} />
      <FormInput control={control} name="notes" label="Notes" type="text" />
      <FormDropdown control={control} name="trainingHistory" label="Training history" options={historyDropdown} />
      <FormDropdown control={control} name="trainingHours" label="Training hours (per day)" options={hourDropdown} parseAsNumber />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
