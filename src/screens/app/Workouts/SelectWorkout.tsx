import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import HeaderTitleImage from '~/components/Blocks/HeaderTitleImage';
import StickyHeader from '~/components/Layout/StickyHeader';
import CustomButton from '~/components/Buttons/CustomButton';
import { FormDropdown } from '~/components/Form';
import InfoBox from '~/components/Layout/InfoBox';
import Supersets from '~/components/Blocks/Supersets';
import Loading from '~/components/Loading';

import { fetchProgramsTree } from '~/data/supabase/workoutsHandler';
import useTranslation from '~/data/helpers/translation';
import { toastSuccess, toastError } from '~/data/helpers/toast';
import { buildProgramOptions, buildWeekOptions, buildDayOptions, findProgram, findWeek, findDay, firstWeek, firstDay, headerFromProgram } from '~/data/helpers/workouts';
import { upsertWorkoutSchedule } from '~/data/supabase/workoutSchedulesHandler';
import type { WorkoutProgram, WorkoutDay, WorkoutItem } from '~/data/types';

import __base from '~/assets/styles/base';

type SelectForm = { programId?: number; weekId?: number; dayId?: number };

export default function SelectWorkout() {
  const t = useTranslation().workouts;
  const navigation = useNavigation<any>();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const { params } = useRoute<any>();
  const returnTo: 'Home' | 'Workouts' = params?.returnTo ?? 'Home';
  const pickedISO: string | undefined = params?.isoDate;

  const { control, setValue } = useForm<SelectForm>({
    defaultValues: { programId: undefined, weekId: undefined, dayId: undefined },
    mode: 'onChange',
  });

  const programId = useWatch({ control, name: 'programId' });
  const weekId = useWatch({ control, name: 'weekId' });
  const dayId = useWatch({ control, name: 'dayId' });

  function preselectFirst(setValue: any, p?: WorkoutProgram) {
    if (!p) return;
    setValue('programId', p.id);
    const w = firstWeek(p);
    setValue('weekId', w?.id);
    setValue('dayId', firstDay(w)?.id);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchProgramsTree();
        setPrograms(res ?? []);
        preselectFirst(setValue, res?.[0]);
      } catch (e: any) {
        toastError('Error', e?.message ?? 'Error');
      } finally { setLoading(false) }
    })();
  }, [setValue]);

  useEffect(() => {
    if (!programId) return;
    const p = findProgram(programs, programId);
    const w = firstWeek(p);
    setValue('weekId', w?.id);
    setValue('dayId', firstDay(w)?.id);
  }, [programId, programs, setValue]);

  useEffect(() => {
    if (!programId || !weekId) return;
    const p = findProgram(programs, programId);
    const w = findWeek(p, weekId);
    setValue('dayId', firstDay(w)?.id);
  }, [programId, weekId, programs, setValue]);

  const program = useMemo(() => findProgram(programs, programId), [programs, programId]);
  const week    = useMemo(() => findWeek(program, weekId), [program, weekId]);
  const day: WorkoutDay | undefined = useMemo(() => findDay(week, dayId), [week, dayId]);
  const programOptions = useMemo(() => buildProgramOptions(programs), [programs]);
  const weekOptions    = useMemo(() => buildWeekOptions(program), [program]);
  const dayOptions     = useMemo(() => buildDayOptions(week), [week]);
  const { image, title, subtitle, description } = headerFromProgram(program);
  const items: WorkoutItem[] = day?.items ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const targetISO = pickedISO ?? today;
  const infoBoxItems = {
    box1: { icon: 'Weight',   value: '98kg', label: 'Weight' },
    box2: { icon: 'Birthday', value: '16%',  label: 'Bodyfat' },
  };

  const handleRegister = React.useCallback(async () => {
    try {
      if (!dayId) throw new Error('No day selected');
      await upsertWorkoutSchedule({ workoutDayId: dayId, isoDate: targetISO });
      toastSuccess('Scheduled', 'Workout saved to your calendar.');
      navigation.navigate(returnTo);
    } catch (e: any) {
      toastError('Error', e?.message ?? 'Could not schedule workout.');
    }
  }, [dayId, targetISO, navigation, returnTo]);

  if (loading) return <Loading />;
  return (
    <StickyHeader title={title} noSticky padded={false}>
      <HeaderTitleImage image={image} title={title} subtitle={subtitle} description={description} />
      <View style={[__base.paddingHorizontal, { paddingBottom: 100, paddingTop: 30 }]}>
        <InfoBox box1={infoBoxItems.box1} box2={infoBoxItems.box2} />
        <Text style={[__base.textBold]}>
          {t.choose ?? 'Choose Workout'}
        </Text>
        <FormDropdown control={control} name="programId" noMargin options={programOptions} parseAsNumber />
        <FormDropdown control={control} name="weekId"    noMargin options={weekOptions}    parseAsNumber />
        <FormDropdown control={control} name="dayId"     noMargin options={dayOptions}     parseAsNumber />
        <View style={__base.divider} />
        <Supersets items={items} />
        <CustomButton title={t.register ?? 'Register workout'} backgroundColor="#000" textColor="#FFF" onPress={handleRegister} />
      </View>
    </StickyHeader>
  );
}
