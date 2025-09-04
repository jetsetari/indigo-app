// src/data/forms/metrics/saveValues.ts
import { useUserStore } from '~/data/store/userStore';
import { createClientMetrics } from '~/data/supabase/clientsHandler';
import type { MetricsForm } from './validation';
import type { MetricSystemDB, MeasuredBy } from '~/data/types';

// If your DB uses 'metric'/'imperial', use this mapping:
const mapMetricSystem = (ui: 'kg/cm' | 'lbs/inches'): 'metric' | 'imperial' =>
  ui === 'kg/cm' ? 'metric' : 'imperial';



// If instead your DB uses snake-case, swap for:
// const mapMetricSystem = (ui: 'kg/cm' | 'lbs/inches'): 'kg_cm' | 'lbs_in' =>
//   ui === 'kg/cm' ? 'kg_cm' : 'lbs_in';

export default async function saveValues(values: MetricsForm) {
  const client = useUserStore.getState().client;
  if (!client?.id) throw new Error('No client found in store');
  const metricMapped: MetricSystemDB = values.metric_system === 'kg/cm' ? 'metric' : 'imperial';
  const byMapped: MeasuredBy = values.measured_by.toLowerCase() as MeasuredBy;

  return await createClientMetrics({
    client_id     : client.id,
    metric_system : mapMetricSystem(values.metric_system),   // ✅ map to DB
    weight        : Number(values.weight),
    weight_goal   : Number(values.weight_goal),
    height        : Number(values.height),
    fat_percentage: values.fat_percentage == null ? null : Number(values.fat_percentage),
    measured_by   : values.measured_by.toLowerCase() as 'manual' | 'ai', // ✅ normalize
    image_front   : values.image_front ?? null,
    image_side    : values.image_side ?? null,
    image_back    : values.image_back ?? null,
  });
}
