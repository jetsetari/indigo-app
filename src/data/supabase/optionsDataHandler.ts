// src/data/supabase/optionsDataHandler.ts
import { supabase } from './connection';

export type GoalCategory = 'weight' | 'performance' | 'sport';
export type GoalOption = { slug: string; label: string };
export type GoalsGrouped = {
  weight: GoalOption[];
  performance: GoalOption[];
  sport: GoalOption[];
};

/** Fetch all options and group by type (weight|performance|sport). */
export async function getAllGoalsOptions(): Promise<GoalsGrouped> {
  const { data, error } = await supabase
    .from('options_goals')
    .select('slug,label,type')
    .order('label', { ascending: true });

  if (error) throw error;

  const grouped: GoalsGrouped = { weight: [], performance: [], sport: [] };
  for (const r of (data ?? [])) {
    const opt = { slug: r.slug as string, label: r.label as string };
    if (r.type === 'weight') grouped.weight.push(opt);
    else if (r.type === 'performance') grouped.performance.push(opt);
    else if (r.type === 'sport') grouped.sport.push(opt);
  }
  return grouped;
}

/** Fetch options for a single type. */
export async function getGoalsOptions(type: GoalCategory): Promise<GoalOption[]> {
  const { data, error } = await supabase
    .from('options_goals')
    .select('slug,label,type')
    .eq('type', type)
    .order('label', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({ slug: r.slug as string, label: r.label as string }));
}

export type ExperienceOption = { slug: string; label: string };
export type HoursOption = { label: string; value: number };

export type LevelOptions = {
  experience: ExperienceOption[];  // type = 'group_experience'
  history: ExperienceOption[];     // type = 'training_history'
  hours: HoursOption[];            // 0.5 .. 5.0
};

/** Build 0.5 → 5.0 in 0.5 steps as dropdown options. */
function buildHalfHourOptions(): HoursOption[] {
  const out: HoursOption[] = [];
  for (let n = 0.5; n <= 5.0 + 1e-9; n += 0.5) {
    const val = Math.round(n * 2) / 2; // avoid FP drift
    out.push({ label: `${val} h`, value: val });
  }
  return out;
}

/** Fetch experiences from `options_experiences` table and group by `type`. */
export async function getLevelOptions(): Promise<LevelOptions> {
  const { data, error } = await supabase
    .from('options_experiences')
    .select('slug,label,type')
    .order('label', { ascending: true });

  if (error) throw error;

  const experience: ExperienceOption[] = [];
  const history: ExperienceOption[] = [];

  for (const row of data ?? []) {
    const opt = { slug: row.slug as string, label: row.label as string };
    if (row.type === 'group_experience') experience.push(opt);
    else if (row.type === 'training_history') history.push(opt);
  }

  return { experience, history, hours: buildHalfHourOptions() };
}

export async function getSupplementOptions(): Promise<GoalOption[]> {
  const { data, error } = await supabase
    .from('options_supplements')
    .select('slug,label')
    .order('label', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({ slug: r.slug as string, label: r.label as string }));
}

