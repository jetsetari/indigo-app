import { supabase } from './connection';
import { useUserStore } from '~/data/store/userStore';

export type ClientWorkoutLog = {
  id: number;
  client_id: number;
  date: string; // YYYY-MM-DD
  workout_item_id: number;
  weight: number | null;
  reps: string | null;
  like: boolean | null;
  notes: string | null;
  created_at: string;
};

export async function insertWorkoutLog(input: {
  workoutItemId: number;
  date?: string;          // defaults to today
  weight?: number | null;
  reps?: string | null;
  like?: boolean | null;
  notes?: string | null;
  clientId?: number;      // defaults from store
}) {
  const clientId = input.clientId ?? useUserStore.getState().client?.id;
  if (!clientId) throw new Error('Missing client id');
  const date = input.date ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('client_workout_logs')
    .insert({
      client_id: clientId,
      date,
      workout_item_id: input.workoutItemId,
      weight: input.weight ?? null,
      reps: input.reps ?? null,
      like: input.like ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ClientWorkoutLog;
}


export async function getLogsForDate(clientId: number, isoDate?: string) {
  const date = isoDate ?? new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('client_workout_logs')
    .select('workout_item_id')
    .eq('client_id', clientId)
    .eq('date', date);

  if (error) throw error;
  // Count logs per workout_item_id (used to infer set index)
  const counts = new Map<number, number>();
  for (const row of data ?? []) {
    const id = Number(row.workout_item_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}