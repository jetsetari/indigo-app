import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '~/data/store/userStore';
import { levelSchema, type LevelFormInput } from '~/data/forms/level/validation';
import defaultValues from '~/data/forms/level/defaultValues';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { buildSubmit, handleInvalid } from '~/data/forms/level/submit';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';

import RHFWeekDayList from '~/components/Form/WeekDayList/RHF';
import RHFMultiSelectSection from '~/components/Form/MultiSelectSection/RHF';
import RHFInput from '~/components/Form/Input/RHF';
import RHFDropdown from '~/components/Form/Dropdown/RHF';

import { getLevelOptions } from '~/data/supabase/optionsDataHandler';
import __base from '~/assets/styles/base';

export default function Level() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatar_url ?? undefined;

  const { control, handleSubmit } = useForm<LevelFormInput>({
    resolver: zodResolver(levelSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const [loading, setLoading] = useState(true);
  const [experienceOptions, setExperienceOptions] = useState<{label:string;slug:string}[]>([]);
  const [trainingHistoryOptions, setTrainingHistoryOptions] = useState<{label:string;slug:string}[]>([]);
  const [trainingHoursOptions, setTrainingHoursOptions] = useState<{label:string; value:number}[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { experience, history, hours } = await getLevelOptions();
      if (!alive) return;
      setExperienceOptions(experience);
      setTrainingHistoryOptions(history);
      setTrainingHoursOptions(hours);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const onValid = useCallback(
    buildSubmit({
      client_id: client!.id,
      onDone: () => navigation.navigate('EatingHabits'),
    }),
    [client?.id, navigation]
  );
  const onInvalid = useCallback(handleInvalid(), []);

  if (loading) return <Loading />;

  console.log(trainingHoursOptions);

  return (
    <StickyHeader title="Fitness Level">
      <HeaderWithExtra back="Goals" title={'How would you rate'} subtitle="your current fitness level?" image={avatarUrl} />
      <RHFWeekDayList control={control} name="training_days" />
      <RHFMultiSelectSection control={control} name="experience_slugs" title="Experience" options={experienceOptions} />
      <RHFInput control={control} name="notes" label="Got more to share?" placeholder="Fill in any details that could be relevant" type="text" />
      <RHFDropdown control={control} name="training_history" label="What describes your training history?" options={trainingHistoryOptions.map(o => ({ label: o.label, value: o.slug }))} />
      <RHFDropdown control={control} name="training_hours" label="How many hours are you willing to train per day?" options={trainingHoursOptions.map(o => ({ label: o.label, value: o.value }))} parseAsNumber />
      <CustomButton title="Next" backgroundColor="#000" textColor="#FFF" onPress={handleSubmit(onValid, onInvalid)} />
    </StickyHeader>
  );
}
