import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import RHFMultiSelectSection from '~/components/Form/MultiSelectSection/RHF';
import CustomButton from '~/components/Buttons/CustomButton';
import Loading from '~/components/Loading';

import { useUserStore } from '~/data/store/userStore';
import { getSupplementOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';
import defaultValues from '~/data/forms/supplements/defaultValues';
import { supplementsSchema, type SupplementsInput } from '~/data/forms/supplements/validation';
import { buildSubmit, handleInvalid } from '~/data/forms/supplements/submit';

export default function Supplements() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);

  const { control, handleSubmit } = useForm<SupplementsInput>({
    resolver: zodResolver(supplementsSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<GoalOption[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const list = await getSupplementOptions();
      if (!alive) return;
      setOptions(list);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const onValid = useCallback(
    buildSubmit({
      client_id: client!.id,
      onDone: () => navigation.navigate('Home'), // or your next screen
    }),
    [client?.id, navigation]
  );
  const onInvalid = useCallback(handleInvalid, []);

  if (loading || saving) return <Loading />;

  return (
    <StickyHeader title="Supplements">
      <HeaderWithExtra back="EatingHabits" title="Supplements" subtitle="Select the ones you take" image={client?.avatar_url ?? undefined}
      />
      <RHFMultiSelectSection control={control} name="supplement_slugs" title="I take these supplements" options={options} />
      <CustomButton title="Next" backgroundColor="#000" textColor="#FFF"
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
