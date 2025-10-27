import { supabase } from './connection';
import { useUserStore } from '~/data/store/userStore';

export type WorkoutScheduleRow = {
  id: number;
  client_id: number;
  workout_day_id: number;
  date: string;           // 'YYYY-MM-DD'
  created_at: string;
};

/** Schedule (or replace) a workout day for a given calendar date, per client. */
export async function upsertWorkoutSchedule(opts: {
  clientId?: number;        // if omitted, read from store
  workoutDayId: number;
  isoDate: string;          // 'YYYY-MM-DD'
}) {
  const clientId = opts.clientId ?? useUserStore.getState().client?.id ?? undefined;
  if (!clientId) throw new Error('Missing client id');
  if (!opts.isoDate) throw new Error('Missing date');
  if (!opts.workoutDayId) throw new Error('Missing workout_day_id');

  // Unique on (client_id, date) → upsert by those columns
  const { data, error } = await supabase
    .from('workout_schedules')
    .upsert(
      { client_id: clientId, workout_day_id: opts.workoutDayId, date: opts.isoDate },
      { onConflict: 'client_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutScheduleRow;
}

/** Get the client's scheduled workout for a specific date. */
export async function getScheduleByDate(isoDate?: string, clientId?: number) {
  const cid = clientId ?? useUserStore.getState().client?.id ?? undefined;
  if (!cid) throw new Error('Missing client id');

  const date = isoDate ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('workout_schedules')
    .select('*')
    .eq('client_id', cid)
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return (data as WorkoutScheduleRow | null);
}
/** List schedules over a date range (inclusive) for the current client. */
export async function listSchedulesInRange(fromIso: string, toIso: string, clientId?: number) {
  const cid = clientId ?? useUserStore.getState().client?.id ?? undefined;
  if (!cid) throw new Error('Missing client id');

  const { data, error } = await supabase
    .from('workout_schedules')
    .select('*')
    .eq('client_id', cid)
    .gte('date', fromIso)
    .lte('date', toIso)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as WorkoutScheduleRow[];
}

/** Delete a schedule for a given date (for current client). */
export async function deleteSchedule(isoDate: string, clientId?: number) {
  const cid = clientId ?? useUserStore.getState().client?.id ?? undefined;
  if (!cid) throw new Error('Missing client id');

  const { error } = await supabase
    .from('workout_schedules')
    .delete()
    .eq('client_id', cid)
    .eq('date', isoDate);

  if (error) throw error;
}
