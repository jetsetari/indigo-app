// Fetch goal option lists from Supabase
// Tables: weight_options, performance_options, sport_training_options
// Shape expected by MultiSelectSection: { slug: string; label: string }


import { getSupabase } from '~/data/supabase/connection';

export type GoalOption = { slug: string; label: string };

async function fetchOptions(table: string): Promise<GoalOption[]> {
  const { data, error } = await getSupabase()
    .from(table)
    .select('slug,label')
    .order('label', { ascending: true });

  if (error) {
    // Prefer your toast helpers if available
    // toastError('Could not load options', error.message);
    console.warn(`[options] ${table} →`, error.message);
    return [];
  }
  // Defensive: filter bad rows & dedupe by slug
  const seen = new Set<string>();
  return (data ?? [])
    .filter((r): r is GoalOption => !!r?.slug && !!r?.label)
    .filter((r) => (seen.has(r.slug) ? false : seen.add(r.slug)));
}

export const getWeightOptions = () => fetchOptions('weight_options');
export const getPerformanceOptions = () => fetchOptions('performance_options');
export const getSportTrainingOptions = () => fetchOptions('sport_training_options');

export async function getAllGoalsOptions() {
  const [weight, performance, sport] = await Promise.all([
    getWeightOptions(),
    getPerformanceOptions(),
    getSportTrainingOptions(),
  ]);
  return { weight, performance, sport };
}


export type LabeledSlug = { slug: string; label: string };
export type LabeledNumber = { value: number; label: string };

async function fetchSlugOptions(table: string): Promise<LabeledSlug[]> {
  const { data, error } = await getSupabase().from(table).select('slug,label').order('label');
  if (error) return [];
  return (data ?? []).filter((r): r is LabeledSlug => !!r?.slug && !!r?.label);
}

async function fetchNumberOptions(table: string): Promise<LabeledNumber[]> {
  const { data, error } = await getSupabase().from(table).select('value,label').order('value');
  if (error) return [];
  return (data ?? []).filter((r): r is LabeledNumber => typeof r?.value === 'number' && !!r?.label);
}

export const getExperienceOptions = () => fetchSlugOptions('experience_options');
export const getTrainingHistoryOptions = () => fetchSlugOptions('training_history_options');
export const getTrainingHoursOptions = () => fetchNumberOptions('training_hours_options');

export async function getLevelOptions() {
  const [experience, history, hours] = await Promise.all([
    getExperienceOptions(),
    getTrainingHistoryOptions(),
    getTrainingHoursOptions(),
  ]);
  return { experience, history, hours };
}

export async function getSupplementOptions(): Promise<GoalOption[]> {
  const { data, error } = await getSupabase()
    .from('supplement_options')
    .select('slug,label')
    .order('label');
  if (error) return [];
  return (data ?? []).filter((r): r is GoalOption => !!r?.slug && !!r?.label);
}