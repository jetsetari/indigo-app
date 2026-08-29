import React, { useMemo, useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormToggle, FormHorizontalPicker, FormDropdown, FormInput, FormImageUpload } from '~/components/Form';
import CustomButton from '~/components/Buttons/CustomButton';
import { useUserStore } from '~/data/store/userStore';
import { updateClient, addClientMeasurement } from '~/data/supabase/clientsHandler';
import { convertMetricsFields, getHeightOptions, snapHeightToOptions } from '~/data/helpers/metrics';
import { parseUnitSystem, toDisplayHeight, toDisplayWeight, toStoredHeight, toStoredWeight, weightUnit } from '~/data/helpers/units';
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

  const system = parseUnitSystem(client?.metricSystem);
  const displayHeight = toDisplayHeight(client?.height, system);
  const { control, watch, getValues, setValue, handleSubmit } = useForm<Values>({
    defaultValues: {
      metricSystem: system,
      weight: toDisplayWeight(client?.lastWeight, system) ?? (system === 'imperial' ? 165 : 75),
      desiredWeight: client?.desiredWeight != null ? String(toDisplayWeight(client.desiredWeight, system) ?? '') : '',
      height: displayHeight != null ? snapHeightToOptions(displayHeight, system) : (system === 'imperial' ? 66 : 175),
    },
    mode: 'onSubmit',
  });

  const metricSystem = parseUnitSystem(watch('metricSystem'));
  const heightOptions = useMemo(() => getHeightOptions(metricSystem), [metricSystem]);

  const applyUnitConversion = (next: string, previous?: string) => {
    const converted = convertMetricsFields(previous, next, getValues());
    if (converted.weight != null) setValue('weight', converted.weight);
    if (converted.desiredWeight != null) setValue('desiredWeight', converted.desiredWeight);
    if (converted.height != null) setValue('height', converted.height);
  };

  const onSave = handleSubmit(async (v) => {
    try {
      await updateClient({
        metricSystem: v.metricSystem,
        height: toStoredHeight(v.height, v.metricSystem),
        desiredWeight: v.desiredWeight ? toStoredWeight(v.desiredWeight, v.metricSystem) : null,
      });
      const id = useUserStore.getState().client?.id;
      if (id) {
        await addClientMeasurement({
          clientId: id,
          weight: toStoredWeight(v.weight, v.metricSystem),
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
      <FormToggle control={control} name="metricSystem" options={[{label:'Imperial',value:'imperial'},{label:'Metric',value:'metric'}]} onValueChange={applyUnitConversion} />
      <FormInput control={control} name="desiredWeight" label={`Goal weight (${weightUnit(metricSystem)})`} type="number" />
      <FormDropdown control={control} name="height" label="Height" options={heightOptions} parseAsNumber />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSave} />
    </View>
  );
}
