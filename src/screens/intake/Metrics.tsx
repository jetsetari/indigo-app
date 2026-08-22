import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, useWatch } from 'react-hook-form';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import { FormToggle, FormHorizontalPicker, FormDropdown, FormInput, FormImageUpload } from '~/components/Form';
import { useRoute } from '@react-navigation/native';

import { registerDefault as _ignore } from '~/data/forms/defaultValues'; 
import { metricsDefault } from '~/data/forms/defaultValues';
import { validateMetrics } from '~/data/forms/validationRules';
import { getHeightOptions, getWeightPickerConfig } from '~/data/helpers/metrics';
import { addClientMeasurement, updateClient, appendDoneScreen } from '~/data/supabase/clientsHandler';

import { toastError, toastSuccess } from '~/data/helpers/toast';
import useTranslation from '~/data/helpers/translation';
import { useUserStore } from '~/data/store/userStore';
import { logout } from '~/data/supabase/authHandler';
import Loading from '~/components/Loading';

import __base from '~/assets/styles/base';

type MetricsValues = typeof metricsDefault;

const API_BASE = 'https://indigo-backend-j5pl.onrender.com';

export default function Metrics() {
  const navigation = useNavigation<any>();
  const t = useTranslation().metrics;
  const client = useUserStore((s) => s.client);

  const { params } = useRoute<any>();
  const isSettings = params?.mode === 'settings';
  const [loading, setLoading] = useState<false|string>(false);

  const { control, watch, reset, getValues, handleSubmit, setValue } = useForm<MetricsValues>({
    defaultValues: metricsDefault,
    mode: 'onSubmit',
    shouldUnregister: false,
  });

  const metricSystem = watch('metricSystem');
  const heightOptions = useMemo(() => getHeightOptions(metricSystem ?? 'metric'), [metricSystem]);
  const { min, max, unit } = getWeightPickerConfig(metricSystem ?? 'metric', t);
  
  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateClient({
        metricSystem: values.metricSystem,                     // 'metric' | 'imperial'
        height: values.height,                                 // number
        desiredWeight: values.desiredWeight ? Number(values.desiredWeight) : null,
      });
      const clientId = useUserStore.getState().client?.id;
      if (!clientId) throw new Error('Missing client id');
      await addClientMeasurement({
        clientId,
        weight: typeof values.weight === 'number' ? values.weight : Number(values.weight),
        bodyfat: values.bodyfat ? Number(values.bodyfat) : null,
        pictureFront: values.pictureFront ?? null,
        pictureSide:  values.pictureSide  ?? null,
        pictureBack:  values.pictureBack  ?? null,
      });
      toastSuccess(t.toastSavedTitle ?? 'Saved', t.toastSavedBody ?? 'Your measurements are saved.');
      await appendDoneScreen('metrics');
      navigation.navigate('Goals');
    } catch (e) {
      toastError(t.errors?.saveFailed ?? 'Could not save your measurements', String((e as Error)?.message ?? ''));
    }
  });

  const onCalculatePress = useCallback(async () => {
    const { pictureFront, pictureSide, pictureBack } = getValues();
    if (!pictureFront || !pictureSide || !pictureBack) {
      toastError(t.photos.missingTitle ?? 'Missing photos', t.photos.missingBody ?? 'Please upload front, side, and back photos.');
      return;
    }

    try {
      // Backend expects publicly accessible image URLs (not base64).
      setLoading('Doing AI Estimate: Checking front, side, back photo');
      const res = await fetch(`${API_BASE}/estimate-bodyfat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front: pictureFront,
          side: pictureSide,
          back: pictureBack,
        }),
      });
      const data = await res.json();

      if (data?.type === 'success') {
        setLoading(`Estimated bodyfat: ${data.value}%`);
        setValue('bodyfat', String(data.value));
        toastSuccess('AI Estimation', `Estimated ${data.value}%`);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } else {
        console.log(data);
        setLoading(false);
        toastError('AI Estimation', data?.value || 'Unable to estimate.');
      }
    } catch (error) {
      setLoading(false);
      toastError('AI Estimation', 'Failed to process images. Please try again.');
      console.error('AI Estimation error:', error);
    }
  }, [getValues, setValue, t]);

  const displayName = client?.firstName ?? '';
  const avatarUrl = client?.avatarUrl ?? undefined;

  if(loading) return <Loading text={loading} />

  return (
    <StickyHeader title={t.screenTitle}>
      <HeaderWithExtra
        {...(isSettings
          ? { back: 'Profile' }
          : { onBack: () => logout(navigation) })}
        title={(t.header.title || '').replace('{{name}}', displayName)}
        subtitle={t.header.subtitle}
        image={avatarUrl}
      />
      <FormToggle control={control} name="metricSystem" options={[{ label: t.system.imperial, value: 'imperial' },{ label: t.system.metric, value: 'metric' }]} rules={validateMetrics.metricSystem} />
      <FormHorizontalPicker control={control} name="weight" label={t.weight.label} unit={unit} min={min} max={max} />
      <FormInput control={control} name="desiredWeight" label={t.weightGoal.label} placeholder="" type="number" required rules={validateMetrics.desiredWeight} />
      <FormDropdown control={control} name="height" label={t.height.label} required options={heightOptions} parseAsNumber rules={validateMetrics.height} />
      <Text style={[__base.textBold, { marginBottom: 6 }]}>{t.photos.label ?? 'Progress photos'}</Text>
      <Text style={[__base.text, { color: '#AAA', marginBottom: 10, fontSize: 13 }]}>
        Add front, side, and back photos, then run AI estimation to fill your fat percentage.
      </Text>
      <View style={[{ gap: 12, flexDirection: 'row', marginBottom: 16 }]}>
        <FormImageUpload control={control} name="pictureFront" filepath="clients/progress" variant="square" size={75} label={t.photos.front ?? 'Front'} />
        <FormImageUpload control={control} name="pictureSide"  filepath="clients/progress" variant="square" size={75} label={t.photos.side ?? 'Side'} />
        <FormImageUpload control={control} name="pictureBack"  filepath="clients/progress" variant="square" size={75} label={t.photos.back ?? 'Back'} />
      </View>
      <View style={{ marginBottom: 16 }}>
        <CustomButton title={t.ctaCalc} backgroundColor="#FFF" textColor="#000" onPress={onCalculatePress} />
      </View>
      <FormInput control={control} name="bodyfat" label={t.fat.label} placeholder="%" type="number" rules={validateMetrics.bodyfat} />
      <CustomButton title={(isSettings ? 'Save & Close' : t.ctaNext)} backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </StickyHeader>
  );
}
