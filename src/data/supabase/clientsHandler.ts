// src/data/supabase/clientsHandler.ts
import { getSupabase } from './connection';
import type { ClientRow, ClientUpsertInput, ClientMetricsRow, ClientGoalsRow } from '~/data/types';

// helper you already had:
const toDateString = (d?: Date | null) =>
  d ? d.toISOString().slice(0,10) : null;

export async function getClientByEmail(email: string) {
  const { data } = await getSupabase()
    .from('clients')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  return data as ClientRow | null;
}

export async function ensureClientByEmail(input: ClientUpsertInput): Promise<ClientRow> {
  const supabase = getSupabase();
  const email = input.email.trim().toLowerCase();
  const patch = {
    email,
    first_name: (input.first_name ?? '').toString(), // NOT NULL safe
    last_name : input.last_name ?? null,
    dob       : toDateString(input.dob),
    gender    : input.gender ?? null,
    avatar_url: input.avatar_url ?? null,
    language  : input.language ?? 'en',
  };

  const existing = await getClientByEmail(email);
  if (existing?.id) {
    const { error } = await supabase.from('clients').update(patch).eq('id', existing.id);
    if (error) throw error;
    return { ...existing, ...patch } as ClientRow;
  }

  const { error } = await supabase.from('clients').insert(patch);
  if (error && (error as any).code !== '23505') throw error; // unique race
  const again = await getClientByEmail(email);
  if (!again) throw new Error('Client upsert failed');
  return again;
}

/** Metrics */
export async function createClientMetrics(input: Omit<ClientMetricsRow, 'id'>) {
  const { error } = await getSupabase().from('client_metrics').insert(input);
  if (error) {
    console.warn('client_metrics insert error:', error);
    throw error;
  }
  return true;
}

/** Goals */
export async function upsertClientGoals(input: {
  client_id: number;
  weight_goal: string | null;   // single slug or null
}) {
  const { error } = await getSupabase()
    .from('client_goals')
    .upsert(
      { client_id: input.client_id, weight_goal: input.weight_goal },
      { onConflict: 'client_id' }
    );
  if (error) throw error;
}

export async function setClientPerformanceGoals(client_id: number, slugs: string[]) {
  const supabase = getSupabase();
  let { error } = await supabase.from('client_performance_goals').delete().eq('client_id', client_id);
  if (error) throw error;
  if (slugs.length === 0) return true;
  const rows = slugs.map((performance_slug) => ({ client_id, performance_slug }));
  ({ error } = await supabase.from('client_performance_goals').insert(rows));
  if (error) throw error;
  return true;
}

export async function setClientSportTraining(client_id: number, slugs: string[]) {
  const supabase = getSupabase();
  let { error } = await supabase.from('client_sport_training').delete().eq('client_id', client_id);
  if (error) throw error;
  if (slugs.length === 0) return true;
  const rows = slugs.map((sport_slug) => ({ client_id, sport_slug }));
  ({ error } = await supabase.from('client_sport_training').insert(rows));
  if (error) throw error;
  return true;
}


// Patch (upsert) the single client_goals row by client_id
export async function upsertClientGoalsPatch({
  client_id,
  patch,
}: {
  client_id: number;
  patch: Partial<{
    training_days: string[];
    training_history: string | null;
    training_hours: number | null;
    notes: string | null;
  }>;
}) {
  const supabase = getSupabase();
  // Fallback if you haven’t added UNIQUE(client_id) on client_goals:
  // delete-then-insert ensures single row semantics without read policies.
  await supabase.from('client_goals').delete().eq('client_id', client_id);
  const { error } = await supabase
    .from('client_goals')
    .insert({ client_id, ...patch });
  if (error) throw error;
}

// Replace rows in client_group_experience for this client
export async function setClientGroupExperience(client_id: number, slugs: string[]) {
  const supabase = getSupabase();
  // delete existing
  const del = await supabase.from('client_group_experience').delete().eq('client_id', client_id);
  if (del.error) throw del.error;

  if (!slugs?.length) return;

  const rows = slugs.map((experience_slug) => ({ client_id, experience_slug }));
  const ins = await supabase.from('client_group_experience').insert(rows);
  if (ins.error) throw ins.error;
}

export async function upsertClientNutritionPatch({
  client_id,
  patch,
}: {
  client_id: number;
  patch: Partial<{
    interested_in_nutrition: boolean;
    eating_habits: string | null;
    meals_per_day: number | null;
    daily_kcal_intake: number | null;
    // (allergies, supplements_extra, injuries saved on later screens)
  }>;
}) {
  // delete-then-insert to avoid needing UNIQUE(client_id) and SELECT policies
  const supabase = getSupabase();
  await supabase.from('client_nutrition').delete().eq('client_id', client_id);
  const { error } = await supabase.from('client_nutrition').insert({ client_id, ...patch });
  if (error) throw error;
}

export async function setClientSupplements(client_id: number, slugs: string[]) {
  // delete existing (write-only pattern; no SELECT required)
  const supabase = getSupabase();
  const del = await supabase.from('client_supplements').delete().eq('client_id', client_id);
  if (del.error) throw del.error;

  if (!slugs?.length) return;

  const rows = slugs.map((supplement_slug) => ({ client_id, supplement_slug }));
  const ins = await supabase.from('client_supplements').insert(rows);
  if (ins.error) throw ins.error;
}
