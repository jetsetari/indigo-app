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

/** Get all log entries for a specific workout item on a date, ordered by creation time */
export async function getLogsForItem(clientId: number, workoutItemId: number, isoDate?: string): Promise<ClientWorkoutLog[]> {
  const date = isoDate ?? new Date().toISOString().slice(0, 10);
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
  
  // Check streak starting from today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayISO = today.toISOString().slice(0, 10);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);
  
  // Start checking from today or yesterday (whichever has a workout)
  let checkDate: Date;
  let streak = 0;
  
  if (uniqueDates.includes(todayISO)) {
    checkDate = new Date(today);
    streak = 1;
  } else if (uniqueDates.includes(yesterdayISO)) {
    checkDate = new Date(yesterday);
    streak = 1;
  } else {
    // No workout today or yesterday, streak is 0
    return 0;
  }
  
  checkDate.setHours(0, 0, 0, 0);
  
  // Check consecutive days backwards
  let expectedDate = new Date(checkDate);
  expectedDate.setDate(expectedDate.getDate() - 1);
  
  for (const dateStr of uniqueDates) {
    if (dateStr === todayISO || dateStr === yesterdayISO) continue; // Already counted
    
    const logDate = new Date(dateStr);
    logDate.setHours(0, 0, 0, 0);
    
    const expectedISO = expectedDate.toISOString().slice(0, 10);
    if (dateStr === expectedISO) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // Gap found, streak is broken
      break;
    }
  }
  
  return streak;
}