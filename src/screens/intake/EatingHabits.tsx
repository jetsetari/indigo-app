import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import CustomButton from '~/components/Buttons/CustomButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import RHFDropdown from '~/components/Form/Dropdown/RHF';
import RHFInput from '~/components/Form/Input/RHF';
import RHFSingleSelectGrid from '~/components/Form/SingleSelectGrid/RHF';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import Loading from '~/components/Loading';
import { useUserStore } from '~/data/store/userStore';

import { eatingOptions, mealOptions } from '~/data/content/options'; // hard-coded lists
import defaultValues from '~/data/forms/habbits/defaultValues';
import { eatingHabitsSchema, type EatingHabitsInput } from '~/data/forms/habbits/validation';
import { buildSubmit, handleInvalid } from '~/data/forms/habbits/submit';

import __base from '~/assets/styles/base';

export default function EatingHabits() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatar_url ?? undefined;

  const { control, handleSubmit } = useForm<EatingHabitsInput>({
    resolver: zodResolver(eatingHabitsSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const [saving, setSaving] = useState(false);

  const onValid = useCallback(
    buildSubmit({
      client_id: client!.id,
      onDone: () => navigation.navigate('Supplements'),
    }),
    [client?.id, navigation]
  );
  const onInvalid = useCallback(handleInvalid, []);

  if (saving) return <Loading />;

  return (
    <StickyHeader title="Eating Habits">
      <HeaderWithExtra back="Level" title="Eating Habits" subtitle="Tell us about your nutrition" image={avatarUrl} />

      {/* Eating style (slug) */}
      <RHFSingleSelectGrid control={control} name="eating_habits" options={eatingOptions} />

      {/* Meals per day (number) */}
      <RHFDropdown control={control} name="meals_per_day" label="How often do you eat in a day?" options={mealOptions} parseAsNumber />

      {/* Daily kcal intake (number, optional) */}
      <RHFInput control={control} name="daily_kcal_intake" label="If you know your daily kcal intake?" placeholder="Leave blank if you don’t know" type="number" />

      <CustomButton
        title="Next"
        backgroundColor="#000"
        textColor="#FFF"
        onPress={handleSubmit(async (vals) => {
          try {
            setSaving(true);
            await onValid(vals as any);
          } finally {
            setSaving(false);
          }
        }, onInvalid)}
      />
    </StickyHeader>
  );
}
