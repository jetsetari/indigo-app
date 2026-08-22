import { supabase } from './connection';
import { useUserStore } from '~/data/store/userStore';
import { localTodayISO } from '~/data/helpers/date';

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
  const date = input.date ?? localTodayISO();

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
  const date = isoDate ?? localTodayISO();
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

/** Get all log entries for a specific workout item on a date, ordered by creation time */
export async function getLogsForItem(clientId: number, workoutItemId: number, isoDate?: string): Promise<ClientWorkoutLog[]> {
  const date = isoDate ?? localTodayISO();
  const { data, error } = await supabase
    .from('client_workout_logs')
    .select('*')
    .eq('client_id', clientId)
    .eq('workout_item_id', workoutItemId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ClientWorkoutLog[];
}

/** Get logs for multiple workout items on a date, keyed by workout_item_id */
export async function getLogsForItems(
  clientId: number,
  workoutItemIds: number[],
  isoDate?: string
): Promise<Map<number, ClientWorkoutLog[]>> {
  const map = new Map<number, ClientWorkoutLog[]>();
  if (!workoutItemIds.length) return map;

  const date = isoDate ?? localTodayISO();
  const { data, error } = await supabase
    .from('client_workout_logs')
    .select('*')
    .eq('client_id', clientId)
    .eq('date', date)
    .in('workout_item_id', workoutItemIds)
    .order('created_at', { ascending: true });

  if (error) throw error;

  for (const id of workoutItemIds) map.set(id, []);
  for (const row of (data ?? []) as ClientWorkoutLog[]) {
    const id = Number(row.workout_item_id);
    const list = map.get(id) ?? [];
    list.push(row);
    map.set(id, list);
  }
  return map;
}

/** Update an existing workout log entry */
export async function updateWorkoutLog(
  logId: number,
  updates: {
    reps?: string | null;
    weight?: number | null;
    like?: boolean | null;
    notes?: string | null;
  }
): Promise<ClientWorkoutLog> {
  const { data, error } = await supabase
    .from('client_workout_logs')
    .update({
      reps: updates.reps ?? null,
      weight: updates.weight ?? null,
      like: updates.like ?? null,
      notes: updates.notes ?? null,
    })
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data as ClientWorkoutLog;
}

/** Get total number of distinct workout days (dates) for a client */
export async function getTotalWorkouts(clientId: number): Promise<number> {
  const { data, error } = await supabase
    .from('client_workout_logs')
    .select('date')
    .eq('client_id', clientId);

  if (error) throw error;
  
  // Count distinct dates
  const uniqueDates = new Set((data ?? []).map((row: any) => row.date));
  return uniqueDates.size;
}

/** Get current streak of consecutive days with workouts (ending today or yesterday) */
export async function getWorkoutStreak(clientId: number): Promise<number> {
  const { data, error } = await supabase
    .from('client_workout_logs')
    .select('date')
    .eq('client_id', clientId);

  if (error) throw error;
  
  // Get unique dates, sorted descending (most recent first)
  const uniqueDates = Array.from(new Set((data ?? []).map((row: any) => row.date)))
    .sort()
    .reverse();
  
  if (uniqueDates.length === 0) return 0;
  
  // Check streak starting from today or yesterday (local calendar)
  const todayISO = localTodayISO();
  const yesterdayDate = new Date();
  yesterdayDate.setHours(12, 0, 0, 0);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayISO = localTodayISO(yesterdayDate);
  
  // Start checking from today or yesterday (whichever has a workout)
  let streak = 0;
  let expectedISO: string;
  
  if (uniqueDates.includes(todayISO)) {
    streak = 1;
    expectedISO = yesterdayISO;
  } else if (uniqueDates.includes(yesterdayISO)) {
    streak = 1;
    const dayBefore = new Date(yesterdayDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    expectedISO = localTodayISO(dayBefore);
  } else {
    return 0;
  }
  
  for (const dateStr of uniqueDates) {
    if (dateStr === todayISO || dateStr === yesterdayISO) continue;
    
    if (dateStr === expectedISO) {
      streak++;
      const next = new Date(`${expectedISO}T12:00:00`);
      next.setDate(next.getDate() - 1);
      expectedISO = localTodayISO(next);
    } else if (dateStr < expectedISO) {
      break;
    }
  }
  
  return streak;
}