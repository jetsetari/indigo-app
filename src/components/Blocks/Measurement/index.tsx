import React, { useCallback, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormImageUpload, FormInput } from '~/components/Form';
import CustomButton from '~/components/Buttons/CustomButton';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { addClientMeasurementDate } from '~/data/supabase/clientsHandler';
import { useUserStore } from '~/data/store/userStore';
import { toDisplayWeight, toStoredWeight, weightUnit } from '~/data/helpers/units';
import __base from '~/assets/styles/base';
import { getMeasurementByDate } from '~/data/supabase/clientsHandler';
import Loading from '~/components/Loading';

type Props = { dateISO: string; onSaved?: () => void };

type Values = {
  weight?: string | number | null;
  bodyfat?: string | number | null;
  pictureFront?: string | null;
  pictureSide?: string | null;
  pictureBack?: string | null;
};
const API_BASE = 'https://indigo-backend-j5pl.onrender.com';

export default function MeasurementsInline({ dateISO, onSaved }: Props) {
  const clientId = useUserStore((s) => s.client?.id);
  const metricSystem = useUserStore((s) => s.client?.metricSystem);
  const { control, handleSubmit, setValue, getValues } = useForm<Values>({
    defaultValues: { weight: '', bodyfat: '', pictureFront: null, pictureSide: null, pictureBack: null },
  });
  const [type, setType] = useState<'ai' | 'manual'>('manual');
  const [loading, setLoading] = useState<false|string>(false);

  const onCalculateAI = useCallback(async () => {
    setLoading('Doing AI Estimate: Checking front, side, back photo');
    const { pictureFront, pictureSide, pictureBack } = getValues();
    if (!pictureFront || !pictureSide || !pictureBack) {
      toastError('Missing photos', 'Upload front, side, and back first.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/estimate-bodyfat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: pictureFront, side: pictureSide, back: pictureBack }),
      });
      const data = await res.json();
      if (data?.type === 'success') {
        setValue('bodyfat', String(data.value) as any);
        setType('ai');
        setLoading(false);
        toastSuccess('AI Estimation', `Estimated ${data.value}%`);
      } else {
        setLoading(false);
        toastError('AI Estimation', data?.value || 'Unable to estimate.');
      }
    } catch {
      setLoading(false);
      toastError('AI Estimation', 'Network error.');
    }
  }, [getValues, setValue]);

  useEffect(() => {
    (async () => {
      if (!clientId) return;
      const row = await getMeasurementByDate(clientId, dateISO);
      if (!row) {
        // reset form when switching to a date with no row
        setValue('weight', '' as any);
        setValue('bodyfat', '' as any);
        setValue('pictureFront', null as any);
        setValue('pictureSide', null as any);
        setValue('pictureBack', null as any);
        setType('manual');
        return;
      }
      // prefill form with existing data (even if some fields are null)
      setValue('weight', (toDisplayWeight(row.weight, metricSystem) ?? '') as any);
      setValue('bodyfat', row.bodyfat ?? '' as any);
      setValue('pictureFront', row.picture_front ?? null as any);
      setValue('pictureSide',  row.picture_side  ?? null as any);
      setValue('pictureBack',  row.picture_back  ?? null as any);
      setType((row.measurement_type as 'ai'|'manual') ?? 'manual');
    })();
  }, [clientId, dateISO, metricSystem, setValue]);

  const onSave = handleSubmit(async (vals) => {
    try {
      if (!clientId) throw new Error('Missing client id');
      await addClientMeasurementDate({
        clientId,
        dateISO,
        measurementType: type,
        weight: vals.weight === '' || vals.weight == null ? null : toStoredWeight(vals.weight, metricSystem),
        bodyfat: vals.bodyfat === '' || vals.bodyfat == null ? null : Number(vals.bodyfat),
        pictureFront: vals.pictureFront ?? null,
        pictureSide: vals.pictureSide ?? null,
        pictureBack: vals.pictureBack ?? null,
      });
      setType('manual');
      toastSuccess('Saved', 'Measurements added for this date.');
      onSaved?.();
    } catch (e: any) {
      toastError('Save failed', e?.message ?? 'Try again.');
    }
  });
  if(loading) return <Loading text={loading} />
  return (
    <View style={{ gap: 12, marginTop: 8, paddingBottom: 24 }}>
      <Text style={__base.textBold}>Measurements</Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <FormImageUpload control={control} name="pictureFront" filepath="clients/progress" variant="square" size={64} label="Front" />
        <FormImageUpload control={control} name="pictureSide"  filepath="clients/progress" variant="square" size={64} label="Side" />
        <FormImageUpload control={control} name="pictureBack"  filepath="clients/progress" variant="square" size={64} label="Back" />
      </View>

      <Text style={[__base.text, { color: '#AAA', fontSize: 13 }]}>
        Add all three photos, then run AI estimation to fill bodyfat.
      </Text>
      <CustomButton title="Calculate with AI" backgroundColor="#000" textColor="#FFF" borderColor="#FFF" onPress={onCalculateAI} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <FormInput control={control} name="weight"  label="Weight"   placeholder={weightUnit(metricSystem)} type="number" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <FormInput control={control} name="bodyfat" label="Bodyfat"  placeholder="%"  type="number" />
        </View>
      </View>
      <CustomButton title="Save" backgroundColor="#FFF" textColor="#000" borderColor="#FFF" onPress={onSave} />
    </View>
  );
}
