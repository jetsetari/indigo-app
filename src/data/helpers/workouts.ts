import type { WorkoutProgram, WorkoutWeek, WorkoutDay, WorkoutItem } from '~/data/types';

// --- Dropdown options --------------------------------------------------------
export function buildProgramOptions(programs: WorkoutProgram[]) {
  return programs.map((p) => ({ label: p.title, value: p.id }));
}

export function buildWeekOptions(program?: WorkoutProgram) {
  return (program?.weeks ?? []).map((w) => ({ label: `Week ${w.weekIndex}`, value: w.id }));
}

export function buildDayOptions(week?: WorkoutWeek) {
  return (week?.days ?? []).map((d) => ({ label: d.title || `Day ${d.dayIndex}`, value: d.id }));
}

// --- Simple selectors --------------------------------------------------------
export const findProgram = (programs: WorkoutProgram[], id?: number) =>
  programs.find((p) => p.id === id);

export const findWeek = (program?: WorkoutProgram, id?: number) =>
  program?.weeks?.find((w) => w.id === id);

export const findDay = (week?: WorkoutWeek, id?: number) =>
  week?.days?.find((d) => d.id === id);

export const firstWeek = (program?: WorkoutProgram) => program?.weeks?.[0];
export const firstDay = (week?: WorkoutWeek) => week?.days?.[0];

// --- Header helpers ----------------------------------------------------------
export function headerFromProgram(program?: WorkoutProgram) {
  const image =
    program?.weeks?.[0]?.days?.[0]?.items?.[0]?.exercise?.cover ?? undefined;
  const title = program?.title ?? 'Workout';
  // temporary subtitle/description until real fields exist:
  const subtitle = 'Cutting Plan';
  const description =
    'Burn fat while keeping your hard-earned muscle. This plan combines strength training and high-intensity workouts.';
  return { image, title, subtitle, description };
}

// --- Grouping / coloring -----------------------------------------------------
export function groupBySuperset(items: WorkoutItem[]): Array<[number, WorkoutItem[]]> {
  const map = new Map<number, WorkoutItem[]>();
  for (const it of items) {
    const m = it.supersetLabel ? /^(\d+)/.exec(it.supersetLabel) : null;
    const key = m ? Math.max(1, parseInt(m[1], 10)) : 0;
    const arr = map.get(key) ?? [];
    arr.push(it);
    map.set(key, arr);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b);
}

const SUPERSET_COLORS = [
  '#2563eb', '#16a34a', '#ea580c', '#9333ea', '#dc2626',
  '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444',
  '#14b8a6', '#84cc16', '#d946ef', '#f97316', '#3b82f6',
  '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#eab308',
];

export function colorForSuperset(label?: string | null) {
  if (!label) return { border: '#334155', bg: '#111827' };
  const m = /^(\d+)/.exec(label);
  const idx = m ? Math.max(0, parseInt(m[1], 10) - 1) : 0;
  const base = SUPERSET_COLORS[idx % SUPERSET_COLORS.length];
  return { border: base, bg: `${base}50` };
}

/** Programmed load. 0 / empty / null means bodyweight or no weight — don't show it. */
export function hasWorkoutWeight(weight: unknown): boolean {
  if (weight == null || weight === '') return false;
  const n = Number(weight);
  return Number.isFinite(n) && n > 0;
}
