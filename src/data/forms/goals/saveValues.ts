import { useUserStore } from '~/data/store/userStore';
import { upsertClientGoals, setClientPerformanceGoals, setClientSportTraining } from '~/data/supabase/clientsHandler';
import type { GoalsForm } from './validation';

export default async function saveValues(values: GoalsForm) {
  const client = useUserStore.getState().client;
  if (!client?.id) throw new Error('No client found in store');

  // 1) Upsert single goals row (store weight goal summary as text, slugs joined)
  await upsertClientGoals({
    client_id: client.id,
    weight_goal: values.weightGoals.join(','), // or a humanized label, up to you
  });

  // 2) Replace many-to-many selections
  await setClientPerformanceGoals(client.id, values.performanceGoals);
  await setClientSportTraining(client.id, values.sportGoals);

  return true;
}
