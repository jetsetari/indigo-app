import React, { useMemo, useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormToggle, FormHorizontalPicker, FormDropdown, FormInput, FormImageUpload } from '~/components/Form';
import CustomButton from '~/components/Buttons/CustomButton';
import { useUserStore } from '~/data/store/userStore';
import { updateClient, addClientMeasurement } from '~/data/supabase/clientsHandler';
import { getHeightOptions, getWeightPickerConfig } from '~/data/helpers/metrics';
import { toastSuccess, toastError } from '~/data/helpers/toast';
import Loading from '~/components/Loading';

type Values = {
  metricSystem: 'metric'|'imperial';
  weight: number;
  desiredWeight: string;
  height: number;
  pictureFront?: string|null;
  pictureSide?: string|null;
  pictureBack?: string|null;
  bodyfat?: string;
};

const API_BASE = 'https://indigo-backend-j5pl.onrender.com';

export default function MetricsSettings() {
  const client = useUserStore(s=>s.client);
  const [loading, setLoading] = useState<false|string>(false);

  const { control, watch, getValues, setValue, handleSubmit } = useForm<Values>({
    defaultValues: {
      metricSystem: (client?.metricSystem as any) || 'metric',
      weight: Number(client?.lastWeight ?? 75),
      desiredWeight: client?.desiredWeight ? String(client.desiredWeight) : '',
      height: Number(client?.height ?? 175),
    },
    mode: 'onSubmit',
  });

  const metricSystem = watch('metricSystem') ?? 'metric';
  const heightOptions = useMemo(() => getHeightOptions(metricSystem), [metricSystem]);

  const onSave = handleSubmit(async (v) => {
    try {
      await updateClient({
        metricSystem: v.metricSystem,
        height: v.height,
        desiredWeight: v.desiredWeight ? Number(v.desiredWeight) : null,
      });
      const id = useUserStore.getState().client?.id;
      if (id) {
        await addClientMeasurement({
          clientId: id,
          weight: Number(v.weight),
          bodyfat: v.bodyfat ? Number(v.bodyfat) : null,
          pictureFront: v.pictureFront ?? null,
          pictureSide:  v.pictureSide  ?? null,
          pictureBack:  v.pictureBack  ?? null,
        });
      }
      toastSuccess('Saved', 'Metrics updated.');
    } catch (e:any) {
      toastError('Save failed', e?.message || 'Try again.');
    }
  });
  
  const onAI = useCallback(async () => {
    const { pictureFront, pictureSide, pictureBack } = getValues();
    if (!pictureFront || !pictureSide || !pictureBack) return toastError('Missing photos','Upload all 3 photos.');
    try {
      setLoading('Checking photos…');
      const r = await fetch(`${API_BASE}/estimate-bodyfat`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ front: pictureFront, side: pictureSide, back: pictureBack }),
      }).then(r=>r.json());
      if (r?.type === 'success') {
        setValue('bodyfat', String(r.value));
        toastSuccess('AI Estimation', `Estimated ${r.value}%`);
      } else toastError('AI Estimation', r?.value || 'Unable to estimate.');
    } finally { setLoading(false); }
  }, [getValues, setValue]);

  if (loading) return <Loading text={String(loading)} />;

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormToggle control={control} name="metricSystem" options={[{label:'Imperial',value:'imperial'},{label:'Metric',value:'metric'}]} />
      <FormInput control={control} name="desiredWeight" label="Goal weight" type="number" />
      <FormDropdown control={control} name="height" label="Height" options={heightOptions} parseAsNumber />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSave} />
    </View>
  );
}
