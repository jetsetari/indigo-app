import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormSelectMulti } from '~/components/Form';
import { getSupplementOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';
import { updateClient } from '~/data/supabase/clientsHandler';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { useUserStore } from '~/data/store/userStore';
import CustomButton from '~/components/Buttons/CustomButton';

type Values = { supplements: string[] };

export default function SupplementsSettings() {
  const c = useUserStore(s=>s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: { supplements: c?.supplements ?? [] },
    mode: 'onSubmit',
  });
  const [options, setOptions] = useState<GoalOption[]>([]);

  useEffect(() => { (async () => {
    try { setOptions(await getSupplementOptions()); }
    catch { toastError('Error','Failed to load supplements.'); }
  })(); }, []);

  const onSubmit = useCallback(handleSubmit(async v => {
    try {
      await updateClient({ supplements: v.supplements?.length ? v.supplements : null });
      toastSuccess('Saved','Supplements updated.');
    } catch (e:any){ toastError('Save failed', e?.message || 'Try again.'); }
  }), []);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormSelectMulti control={control} name="supplements" title="Supplements I take" icon="💊" options={options} />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
