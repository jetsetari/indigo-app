// src/data/supabase/workoutsHandler.ts
import { supabase } from './connection';
import { MuscleGroup, Exercise, WorkoutItem, WorkoutDay, WorkoutWeek, WorkoutProgram } from '../types';

/** ---------- Public API ---------- */

/**
 * Fetch a single program with full nested structure.
 */
export async function fetchProgramTree(programId: number): Promise<WorkoutProgram | null> {
  const { data: programs, error: pErr } = await supabase
    .from('workout_programs')
    .select('id,title,created_by_email,created_at,source_program_id')
    .eq('id', programId)
    .maybeSingle();

  if (pErr) throw pErr;
  if (!programs) return null;

  const program = await hydratePrograms([programs]);
  return program[0] ?? null;
}

export async function fetchProgramsTree(clientId?: number): Promise<WorkoutProgram[]> {
  const query = supabase
    .from('workout_programs')
    .select('id,title,created_by_email,created_at,source_program_id')
    .order('created_at', { ascending: false });

  const { data: programs, error: pErr } = clientId
    ? await query.eq('client_id', clientId)
    : await query;

  if (pErr) throw pErr;
  if (!programs?.length) return [];
  return hydratePrograms(programs);
}

async function hydratePrograms(rows: any[]): Promise<WorkoutProgram[]> {
  const programIds = rows.map((r) => r.id);

  // 1) Weeks
  const { data: weeks, error: wErr } = await supabase
    .from('workout_weeks')
    .select('id,program_id,week_index,created_at')
    .in('program_id', programIds)
    .order('program_id', { ascending: true })
    .order('week_index', { ascending: true });

  if (wErr) throw wErr;
  const weekIds = (weeks ?? []).map((w) => w.id);

  // 2) Days
  const { data: days, error: dErr } = weekIds.length
    ? await supabase
        .from('workout_days')
        .select('id,week_id,day_index,title')
        .in('week_id', weekIds)
        .order('week_id', { ascending: true })
        .order('day_index', { ascending: true })
    : { data: [], error: null as any };

  if (dErr) throw dErr;
  const dayIds = (days ?? []).map((d) => d.id);

  // 3) Items
  const { data: items, error: iErr } = dayIds.length
    ? await supabase
        .from('workout_items')
        .select('id,day_id,position,superset_label,exercise_id,sets,reps,weight,rest_seconds,notes,custom_exercise_name')
        .in('day_id', dayIds)
        .order('day_id', { ascending: true })
        .order('position', { ascending: true })
    : { data: [], error: null as any };

  if (iErr) throw iErr;

  // 4) Exercises (+ muscle group)
  const exerciseIds = Array.from(
    new Set((items ?? []).map((it: any) => it.exercise_id).filter(Boolean))
  ) as number[];

  const { data: exercises, error: eErr } = exerciseIds.length
    ? await supabase
        .from('exercises')
        .select('id,name,description,type,level,tags,cover,video,muscle_group_id')
        .in('id', exerciseIds)
    : { data: [], error: null as any };

  if (eErr) throw eErr;

  // 5) Muscle groups
  const muscleGroupIds = Array.from(
    new Set((exercises ?? []).map((ex: any) => ex.muscle_group_id).filter(Boolean))
  ) as number[];

  const { data: mgroups, error: mErr } = muscleGroupIds.length
    ? await supabase
        .from('options_muscle_groups')
        .select('id,name,description,image')
        .in('id', muscleGroupIds)
    : { data: [], error: null as any };

  if (mErr) throw mErr;

  // ---------- Assemble maps ----------
  const exById = new Map<number, Exercise>();
  const mgById = new Map<number, MuscleGroup>();
  (mgroups ?? []).forEach((m: any) =>
    mgById.set(m.id, {
      id: m.id,
      name: m.name,
      description: m.description ?? null,
      image: m.image ?? null,
    })
  );
  (exercises ?? []).forEach((e: any) =>
    exById.set(e.id, {
      id: e.id,
      name: e.name,
      description: e.description ?? null,
      type: e.type ?? null,
      level: e.level ?? null,
      tags: (e.tags ?? null) as string[] | null,
      cover: e.cover ?? null,
      video: e.video ?? null,
      muscleGroup: e.muscle_group_id ? mgById.get(e.muscle_group_id) ?? null : null,
    })
  );

  // items grouped by day
  const itemsByDay = new Map<number, WorkoutItem[]>();
  (items ?? []).forEach((it: any) => {
    const arr = itemsByDay.get(it.day_id) ?? [];
    arr.push({
      id: it.id,
      dayId: it.day_id,
      position: it.position,
      supersetLabel: it.superset_label ?? null,
      exerciseId: it.exercise_id ?? null,
      sets: it.sets ?? null,
      reps: it.reps ?? null,
      weight: it.weight ?? null,
      restSeconds: it.rest_seconds ?? null,
      notes: it.notes ?? null,
      customExerciseName: it.custom_exercise_name ?? null,
      exercise: it.exercise_id ? exById.get(it.exercise_id) ?? null : null,
    });
    itemsByDay.set(it.day_id, arr);
  });

  // days grouped by week
  const daysByWeek = new Map<number, WorkoutDay[]>();
  (days ?? []).forEach((d: any) => {
    const arr = daysByWeek.get(d.week_id) ?? [];
    arr.push({
      id: d.id,
      weekId: d.week_id,
      dayIndex: d.day_index,
      title: d.title ?? null,
      items: itemsByDay.get(d.id) ?? [],
    });
    daysByWeek.set(d.week_id, arr);
  });

  // weeks grouped by program
  const weeksByProgram = new Map<number, WorkoutWeek[]>();
  (weeks ?? []).forEach((w: any) => {
    const arr = weeksByProgram.get(w.program_id) ?? [];
    arr.push({
      id: w.id,
      programId: w.program_id,
      weekIndex: w.week_index,
      createdAt: w.created_at ?? null,
      days: daysByWeek.get(w.id) ?? [],
    });
    weeksByProgram.set(w.program_id, arr);
  });

  // final programs
  const out: WorkoutProgram[] = rows.map((p: any) => ({
    id: p.id,
    title: p.title,
    createdByEmail: p.created_by_email ?? null,
    createdAt: p.created_at ?? null,
    sourceProgramId: p.source_program_id ?? null,
    weeks: weeksByProgram.get(p.id) ?? [],
  }));

  return out;
}

/** Fetch workouts by date range and client_id from workout_days (new schema). */
export async function fetchWorkoutsByDateRange(
  clientId: number,
  fromDate: string,
  toDate: string
): Promise<Array<WorkoutDay & { date: string; coverImage?: string | null }>> {
  // First, get all program IDs for this client
  const { data: programs, error: pErr } = await supabase
    .from('workout_programs')
    .select('id')
    .eq('client_id', clientId);

  if (pErr) throw pErr;
  if (!programs?.length) return [];

  const programIds = programs.map((p: any) => p.id);

  // Get week IDs for these programs
  const { data: weeks, error: wErr } = await supabase
    .from('workout_weeks')
    .select('id')
    .in('program_id', programIds);

  if (wErr) throw wErr;
  if (!weeks?.length) return [];

  const weekIds = weeks.map((w: any) => w.id);

  // Get workout_days in date range for these weeks
  const { data: days, error: dErr } = await supabase
    .from('workout_days')
    .select('id,week_id,day_index,title,date')
    .in('week_id', weekIds)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true });

  if (dErr) throw dErr;
  if (!days?.length) return [];

  const dayIds = days.map((d: any) => d.id);

  // Get items for these days
  const { data: items, error: iErr } = await supabase
    .from('workout_items')
    .select('id,day_id,position,superset_label,exercise_id,sets,reps,weight,rest_seconds,notes,custom_exercise_name')
    .in('day_id', dayIds)
    .order('day_id', { ascending: true })
    .order('position', { ascending: true });

  if (iErr) throw iErr;

  // Get exercises
  const exIds = Array.from(new Set((items ?? []).map((it: any) => it.exercise_id).filter(Boolean)));
  const { data: exs, error: eErr } = exIds.length
    ? await supabase
        .from('exercises')
        .select('id,name,description,type,level,tags,cover,video,muscle_group_id')
        .in('id', exIds)
    : { data: [], error: null as any };

  if (eErr) throw eErr;

  // Get muscle groups
  const mgIds = Array.from(new Set((exs ?? []).map((e: any) => e.muscle_group_id).filter(Boolean)));
  const { data: mgs, error: mErr } = mgIds.length
    ? await supabase
        .from('options_muscle_groups')
        .select('id,name,description,image')
        .in('id', mgIds)
    : { data: [], error: null as any };

  if (mErr) throw mErr;

  const mgById = new Map(mgs?.map((m: any) => [m.id, m]) ?? []);
  const exById = new Map((exs ?? []).map((e: any) => [e.id, { ...e, muscleGroup: e.muscle_group_id ? mgById.get(e.muscle_group_id) ?? null : null }]));

  const itemsByDay = new Map<number, WorkoutItem[]>();
  (items ?? []).forEach((it: any) => {
    const arr = itemsByDay.get(it.day_id) ?? [];
    arr.push({
      id: it.id,
      dayId: it.day_id,
      position: it.position,
      supersetLabel: it.superset_label ?? null,
      exerciseId: it.exercise_id ?? null,
      sets: it.sets ?? null,
      reps: it.reps ?? null,
      weight: it.weight ?? null,
      restSeconds: it.rest_seconds ?? null,
      notes: it.notes ?? null,
      exercise: it.exercise_id ? exById.get(it.exercise_id) ?? null : null,
    });
    itemsByDay.set(it.day_id, arr);
  });

  // Get cover image from first exercise if available
  return days.map((d: any) => {
    const dayItems = itemsByDay.get(d.id) ?? [];
    const firstExercise = dayItems.find((it: any) => it.exercise?.cover)?.exercise;
    return {
      id: d.id,
      weekId: d.week_id,
      dayIndex: d.day_index,
      title: d.title ?? null,
      date: d.date,
      coverImage: firstExercise?.cover ?? null,
      items: dayItems,
    };
  });
}

/** Fetch workout day by date and client_id (new schema). */
export async function fetchDayByDate(clientId: number, date: string) {
  // First, get all program IDs for this client
  const { data: programs, error: pErr } = await supabase
    .from('workout_programs')
    .select('id')
    .eq('client_id', clientId);

  if (pErr) throw pErr;
  if (!programs?.length) return null;

  const programIds = programs.map((p: any) => p.id);

  // Get week IDs for these programs
  const { data: weeks, error: wErr } = await supabase
    .from('workout_weeks')
    .select('id')
    .in('program_id', programIds);

  if (wErr) throw wErr;
  if (!weeks?.length) return null;

  const weekIds = weeks.map((w: any) => w.id);

  // Get workout_day for this date
  const { data: d, error: dErr } = await supabase
    .from('workout_days')
    .select('id,week_id,day_index,title,date')
    .in('week_id', weekIds)
    .eq('date', date)
    .maybeSingle();

  if (dErr) throw dErr;
  if (!d) return null;

  return fetchDayWithItems(d.id);
}

/** Update workout day date (for drag and drop). */
export async function updateWorkoutDayDate(dayId: number, newDate: string) {
  const { error } = await supabase
    .from('workout_days')
    .update({ date: newDate })
    .eq('id', dayId);

  if (error) throw error;
}

/** Fetch one workout day with its items + exercises (+ muscle group). */
export async function fetchDayWithItems(dayId: number) {
  // day
  const { data: d, error: dErr } = await supabase
    .from('workout_days')
    .select('id,week_id,day_index,title,date')
    .eq('id', dayId)
    .maybeSingle();
  if (dErr) throw dErr;
  if (!d) return null;

  // items
  const { data: items, error: iErr } = await supabase
    .from('workout_items')
    .select('id,day_id,position,superset_label,exercise_id,sets,reps,weight,rest_seconds,notes,custom_exercise_name')
    .eq('day_id', dayId)
    .order('position', { ascending: true });
  if (iErr) throw iErr;

  // exercises (+ muscle group)
  const exIds = Array.from(new Set((items ?? []).map((it: any) => it.exercise_id).filter(Boolean)));
  const { data: exs, error: eErr } = exIds.length
    ? await supabase
        .from('exercises')
        .select('id,name,description,type,level,tags,cover,video,muscle_group_id')
        .in('id', exIds)
    : { data: [], error: null as any };
  if (eErr) throw eErr;

  const mgIds = Array.from(new Set((exs ?? []).map((e: any) => e.muscle_group_id).filter(Boolean)));
  const { data: mgs, error: mErr } = mgIds.length
    ? await supabase
        .from('options_muscle_groups')
        .select('id,name,description,image')
        .in('id', mgIds)
    : { data: [], error: null as any };
  if (mErr) throw mErr;

  const mgById = new Map(mgs?.map((m: any) => [m.id, m]) ?? []);
  const exById = new Map((exs ?? []).map((e: any) => [e.id, { ...e, muscleGroup: e.muscle_group_id ? mgById.get(e.muscle_group_id) ?? null : null }]));

  return {
    id: d.id,
    weekId: d.week_id,
    dayIndex: d.day_index,
    title: d.title ?? null,
    items: (items ?? []).map((it: any) => ({
      id: it.id,
      dayId: it.day_id,
      position: it.position,
      supersetLabel: it.superset_label ?? null,
      exerciseId: it.exercise_id ?? null,
      sets: it.sets ?? null,
      reps: it.reps ?? null,
      weight: it.weight ?? null,
      restSeconds: it.rest_seconds ?? null,
      notes: it.notes ?? null,
      customExerciseName: it.custom_exercise_name ?? null,
      exercise: it.exercise_id ? exById.get(it.exercise_id) ?? null : null,
    })),
  };
}
