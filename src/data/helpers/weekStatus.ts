import dayjs from 'dayjs';
import { listSchedulesInRange } from '~/data/supabase/workoutSchedulesHandler';
import { fetchDayWithItems } from '~/data/supabase/workoutsHandler';
import { getLogsForDate } from '~/data/supabase/clientWorkoutLogsHandler';

export type DayStatus = 'none' | 'partial' | 'done';

// "10,8,6" -> 3 ; "300s,200s" -> 2 ; "12" -> 1
const countSetsFromReps = (reps?: string | null) =>
  reps ? (reps.split(',').map(s => s.trim()).filter(Boolean).length || 1) : 1;

/**
 * Returns a map { 'YYYY-MM-DD': 'none'|'partial'|'done' } for the given week.
 * weekStartISO must be a Monday (YYYY-MM-DD).
 */
export async function buildWeekStatus(
  clientId: number,
  weekStartISO: string
): Promise<Record<string, DayStatus>> {
  const start = dayjs(weekStartISO);
  const from = start.format('YYYY-MM-DD');
  const to = start.add(6, 'day').format('YYYY-MM-DD');

  const schedules = await listSchedulesInRange(from, to); // [{ date, workout_day_id }]
  const byDate = new Map<string, number>();
  for (const s of schedules ?? []) byDate.set(s.date, s.workout_day_id);

  const out: Record<string, DayStatus> = {};

  for (let i = 0; i < 7; i++) {
    const d = start.add(i, 'day');
    const iso = d.format('YYYY-MM-DD');

    if (!byDate.has(iso)) { out[iso] = 'none'; continue; }

    const workoutDayId = byDate.get(iso)!;
    const day = await fetchDayWithItems(workoutDayId);
    const items = day?.items ?? [];

    const logsMap = await getLogsForDate(clientId, iso); // Map<workout_item_id, count>

    const allDone = items.every((it: any) => {
      const needed = countSetsFromReps(it?.reps);
      const have = logsMap.get(it.id) ?? 0;
      return have >= needed;
    });

    out[iso] = allDone ? 'done' : 'partial';
  }

  return out;
}