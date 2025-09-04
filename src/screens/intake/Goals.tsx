// src/screens/intake/Goals.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '~/data/store/userStore';

import CustomButton from '~/components/Buttons/CustomButton';
import StickyHeader from '~/components/Layout/StickyHeader';
import MultiSelectSection from '~/components/Form/MultiSelectSection';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import Loading from '~/components/Loading';

import { getAllGoalsOptions, type GoalOption } from '~/data/supabase/optionsDataHandler';
import { upsertClientGoals, setClientPerformanceGoals, setClientSportTraining } from '~/data/supabase/clientsHandler'; // ← same helpers you used for Metrics flow
import { toastSuccess, toastError } from '~/data/helpers/toast';

import __base from '~/assets/styles/base';

export default function Goals() {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);
  const avatarUrl = client?.avatar_url ?? undefined;

  const [weightOptions, setWeightOptions] = useState<GoalOption[]>([]);
  const [performanceOptions, setPerformanceOptions] = useState<GoalOption[]>([]);
  const [sportTrainingOptions, setSportTrainingOptions] = useState<GoalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [weightGoals, setWeightGoals] = useState<string[]>([]);
  const [performanceGoals, setPerformanceGoals] = useState<string[]>([]);
  const [sportGoals, setSportGoals] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { weight, performance, sport } = await getAllGoalsOptions();
      if (!alive) return;
      setWeightOptions(weight);
      setPerformanceOptions(performance);
      setSportTrainingOptions(sport);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const onNext = useCallback(async () => {
    if (!client?.id) return;
    try {
      setLoading(true);

      const primaryWeight = weightGoals[0] ?? null; // take the first selected
      await upsertClientGoals({
        client_id: client.id,
        weight_goal: primaryWeight,
      });

      await setClientPerformanceGoals(client.id, performanceGoals);
      await setClientSportTraining(client.id, sportGoals);

      toastSuccess('Saved', 'Your goals have been saved successfully.');
      navigation.navigate('Level');
    } catch (e: any) {
      console.log(e);
      toastError('Save failed', e?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [client?.id, weightGoals, performanceGoals, sportGoals, navigation]);

  if (loading) return <Loading />;

  return (
    <StickyHeader title="Goals">
      <HeaderWithExtra back="Metrics" title={'Let’s define your goals'} subtitle="Choose what applies." image={avatarUrl} />
      <MultiSelectSection icon="💪" title="Weight Goals" options={weightOptions} selected={weightGoals} onChange={setWeightGoals} />
      <MultiSelectSection icon="🔥" title="Performance" options={performanceOptions} selected={performanceGoals} onChange={setPerformanceGoals} />
      <MultiSelectSection icon="🏃‍♂️" title="Sport specific training" options={sportTrainingOptions} selected={sportGoals} onChange={setSportGoals} />
      <CustomButton title={saving ? 'Saving…' : 'Next'} backgroundColor="#000" textColor="#FFF" onPress={onNext} disabled={saving} />
    </StickyHeader>
  );
}
