// src/screens/intake/Metrics.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { RHFToggle, RHFHorizontalPicker, RHFDropdown, RHFInput, RHFImageUpload } from '~/components/Form';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';

import defaultValues from '~/data/forms/metrics/defaultValues';
import { metricsSchema, type MetricsForm } from '~/data/forms/metrics/validation';
import { buildSubmit, handleInvalid } from '~/data/forms/metrics/submit';

import { getMetrics, getWeightPickerConfig } from '~/data/helpers';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import useTranslation from '~/data/helpers/translation';
import { useUserStore } from '~/data/store/userStore';

import __base from '~/assets/styles/base';

export default function Metrics() {
  const navigation = useNavigation<any>();
  const t = useTranslation().metrics;
  const client = useUserStore((s) => s.client);

  const { control, handleSubmit, setValue, getValues } = useForm<MetricsForm>({
    resolver: zodResolver(metricsSchema),
    defaultValues,
    mode: 'onSubmit',
  });

  const onValid   = useCallback(buildSubmit({ navigation, t }), [navigation, t]);
  const onInvalid = useCallback(handleInvalid(t), [t]);

  const metricSystem = useWatch({ control, name: 'metric_system' }) || 'kg/cm';
  const heightOptions = useMemo(() => getMetrics(metricSystem), [metricSystem]);
  const { min, max, unit } = getWeightPickerConfig(metricSystem as any, t);

  const onSubmitPress = useCallback(() => {
    const fn = handleSubmit(onValid, onInvalid);
    fn();
  }, [handleSubmit, onValid, onInvalid]);

  const onCalculatePress = useCallback(() => {
    const { image_front, image_side, image_back } = getValues();
    if (!image_front || !image_side || !image_back) {
      toastError('Missing photos', 'Please upload front, side, and back photos.');
      return;
    }
    toastSuccess('AI Estimation', 'Doing AI Estimation now.');
    setValue('fat_percentage', 45);
  }, [getValues]);

  const displayName = client?.first_name ?? '';
  const avatarUrl = client?.avatar_url ?? undefined;

  return (
    <StickyHeader title={t.screenTitle}>
      <HeaderWithExtra back="Register" title={t.header.title.replace('{{name}}', displayName)} subtitle={t.header.subtitle} image={avatarUrl} />

      {/* Units */}
      <Text style={[__base.textBold, { marginTop: 8 }]}>{t.system.label}</Text>
      <RHFToggle control={control} name="metric_system" options={['lbs/inches', 'kg/cm']} />

      {/* Weight */}
      <RHFHorizontalPicker control={control} name="weight" label={t.weight.label} unit={unit} min={min} max={max} />

      {/* Goal */}
      <RHFInput control={control} name="weight_goal" label={t.weightGoal.label} placeholder="" type="number" required />

      {/* Height */}
      <RHFDropdown control={control} name="height" label={t.height.label} required options={heightOptions} parseAsNumber />

      {/* Photos */}
      <Text style={[__base.textBold, { marginBottom: 6 }]}>Photos</Text>
      <View style={[{ gap: 12, flexDirection: 'row', marginBottom: 20 }]}>
        <RHFImageUpload control={control} name="image_front" filepath="clients" variant="square" size={75} label="Front" />
        <RHFImageUpload control={control} name="image_side"  filepath="clients" variant="square" size={75} label="Side" />
        <RHFImageUpload control={control} name="image_back"  filepath="clients" variant="square" size={75} label="Back" />
      </View>

      {/* Fat percentage + calculator */}
      <View style={__base.rowGap}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <RHFInput control={control} name="fat_percentage" label={t.fat.label} placeholder="%" type="number" />
        </View>

        <View style={{ marginBottom: 15, flexShrink: 0, marginLeft: 10 }}>
          <CustomButton title={t.ctaCalc} backgroundColor="#FFF" textColor="#000" onPress={onCalculatePress} />
        </View>
      </View>

      {/* Submit  */}
      <CustomButton title={t.ctaNext} backgroundColor="#000" textColor="#FFF" onPress={onSubmitPress} />
    </StickyHeader>
  );
}
