import { getSupabase } from '~/data/supabase/connection';

export type ExerciseRow = {
  id: number;
  name: string;
  cover?: string | null;
  video?: string | null;
  description?: string | null;
  type?: string | null;
  level?: string | null;
  tags?: string[] | null;
  muscle_group_id?: number | null;
};

export type WorkoutItem = {
  id: number;
  day_id: number;
  position: number;
  sets: number | null;
  reps: string | null;
  weight: number | null;
  rest_seconds: number | null;
  superset_label: string | null;
  notes: string | null;
  exercise: ExerciseRow | null;
};

export type WorkoutDay = {
  id: number;
  day_index: number;
  title: string | null;
  items: WorkoutItem[];
};

export type ProgramWeek = {
  program_id: number;
  week_id: number;
  week_index: number;
  days: WorkoutDay[];
};

/** Get all days + items + exercises for:
 *   - given programId
 *   - weekIndex (optional). If omitted, takes the first week of the program.
 */
export async function getProgramWeekWithExercises(
  programId: number,
  weekIndex?: number
): Promise<ProgramWeek | null> {
  // 1) Pick week

  const supabase = getSupabase();

  const weekQuery = supabase
    .from('workout_weeks')
    .select('id,week_index')
    .eq('program_id', programId);

  const { data: weekRow, error: eWeek } = weekIndex
    ? await weekQuery.eq('week_index', weekIndex).limit(1).maybeSingle()
    : await weekQuery.order('week_index', { ascending: true }).limit(1).maybeSingle();

  if (eWeek || !weekRow) return null;

  // 2) Days of week (ordered)
  const { data: dayRows, error: eDays } = await supabase
    .from('workout_days')
    .select('id,day_index,title')
    .eq('week_id', weekRow.id)
    .order('day_index', { ascending: true });

  if (eDays || !dayRows?.length) {
    return {
      program_id: programId,
      week_id: weekRow.id,
      week_index: weekRow.week_index,
      days: [],
    };
  }

  const dayIds = dayRows.map(d => d.id);

  // 3) Items for those days + join exercises
  const { data: itemRows, error: eItems } = await supabase
    .from('workout_items')
    .select(
      'id,day_id,position,sets,reps,weight,rest_seconds,superset_label,notes,exercises(id,name,cover,video,description,type,level,tags,muscle_group_id)'
    )
    .in('day_id', dayIds)
    .order('position', { ascending: true });

  if (eItems) {
    // Return the skeleton days if items fail
    return {
      program_id: programId,
      week_id: weekRow.id,
      week_index: weekRow.week_index,
      days: dayRows.map(d => ({ id: d.id, day_index: d.day_index, title: d.title ?? null, items: [] })),
    };
  }

  // 4) Normalize: exercises can come as object or array depending on generated types
  const itemsByDay = new Map<number, WorkoutItem[]>();
  (itemRows ?? []).forEach((row: any) => {
    const ex = row?.exercises;
    let exercise: ExerciseRow | null = null;
    if (Array.isArray(ex)) {
      if (ex.length) exercise = ex[0] as ExerciseRow;
    } else if (ex) {
      exercise = ex as ExerciseRow;
    }

    const item: WorkoutItem = {
      id: row.id,
      day_id: row.day_id,
      position: row.position,
      sets: row.sets ?? null,
      reps: row.reps ?? null,
      weight: row.weight ?? null,
      rest_seconds: row.rest_seconds ?? null,
      superset_label: row.superset_label ?? null,
      notes: row.notes ?? null,
      exercise,
    };

    const arr = itemsByDay.get(row.day_id) ?? [];
    arr.push(item);
    itemsByDay.set(row.day_id, arr);
  });

  // 5) Assemble days
  const days: WorkoutDay[] = dayRows.map(d => ({
    id: d.id,
    day_index: d.day_index,
    title: d.title ?? null,
    items: (itemsByDay.get(d.id) ?? []).sort((a, b) => a.position - b.position),
  }));

  return {
    program_id: programId,
    week_id: weekRow.id,
    week_index: weekRow.week_index,
    days,
  };
}

/** Convenience: program 2, first week */
export const getFirstWeekOfProgram2 = () => getProgramWeekWithExercises(2, 1);
