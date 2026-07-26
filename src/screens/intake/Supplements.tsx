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
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updateClient, appendDoneScreen } from '~/data/supabase/clientsHandler';
import { getSupplementOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';

type FormValues = {
  supplements: string[]; // maps to clients.supplements (text[])
};

const defaultValues: FormValues = {
  supplements: [],
};

export default function Supplements() {
  const navigation = useNavigation<any>();
  const t = (useTranslation() as any).supplements ?? {};
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatarUrl ?? undefined;
  const { params } = useRoute<any>();
  const isSettings = params?.mode === 'settings';

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues,
    mode: 'onSubmit',
  });

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<GoalOption[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const list = await getSupplementOptions();
        if (!alive) return;
        setOptions(list);
      } catch (e) {
        toastError(t.loadErrorTitle ?? 'Error', t.loadErrorBody ?? 'Failed to load supplements.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onSubmit = useCallback(handleSubmit(async (values) => {
    try {
      await updateClient({
        // store full array (text[]) or null if empty
        supplements: values.supplements?.length ? values.supplements : null,
      });
      toastSuccess(t.savedTitle ?? 'Saved', t.savedBody ?? 'Your supplements have been saved.');
      await appendDoneScreen('supplements');
      navigation.navigate('Home');
    } catch (e: any) {
      toastError(t.saveFailedTitle ?? 'Save failed', e?.message ?? (t.saveFailedBody ?? 'Please try again.'));
    }
  }), [navigation, t]);

  if (loading) return <Loading />;

  return (
    <StickyHeader title={t.screenTitle ?? 'Supplements'}>
      <HeaderWithExtra
        back={isSettings ? 'Profile' : 'EatingHabits'}
        title={t.header?.title ?? 'Supplements'}
        subtitle={t.header?.subtitle ?? 'Select the ones you take'}
        image={avatarUrl}
      />

      <FormSelectMulti
        control={control}
        name="supplements"
        title={t.sectionTitle ?? 'I take these supplements'}
        icon="💊"
        options={options}
      />

      <CustomButton
        title={isSubmitting ? (t.ctaSaving ?? 'Saving…') : (t.ctaNext ?? 'Next')}
        backgroundColor="#000"
        textColor="#FFF"
        onPress={onSubmit}
        disabled={isSubmitting}
      />
    </StickyHeader>
  );
}
