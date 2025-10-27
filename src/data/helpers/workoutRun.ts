import type { WorkoutItem } from '~/data/types';

// Group items by superset number (1A/1B → 1; 2A/2B → 2; no label → 0)
export function groupBySupersetNumber(items: WorkoutItem[]): Map<number, WorkoutItem[]> {
  const m = new Map<number, WorkoutItem[]>();
  for (const it of items) {
    const mm = it.supersetLabel ? /^(\d+)/.exec(it.supersetLabel) : null;
    const key = mm ? Math.max(1, parseInt(mm[1], 10)) : 0;
    const arr = m.get(key) ?? [];
    arr.push(it);
    m.set(key, arr);
  }
  // sort each group by position
  for (const [k, arr] of m) m.set(k, [...arr].sort((a,b)=>a.position-b.position));
  return m;
}

// Sets count for a superset (take the max sets among items in that group)
export function setsCountForGroup(group: WorkoutItem[]): number {
  const max = Math.max(...group.map(i => i.sets ?? 0), 0);
  return max || 1;
}

// Parse reps string like "10,8,6" or "300s,300s" → array
export function parseReps(reps?: string | null): string[] {
  if (!reps) return [];
  return reps.split(',').map(s => s.trim()).filter(Boolean);
}

// Get the target reps for a given set index (0-based) from one item
export function repsForSet(item: WorkoutItem, setIdx: number): string | undefined {
  const arr = parseReps(item.reps ?? '');
  return arr[setIdx];
}

// Find the next todo index in a list (doneIds is a Set of workout_item_id)
export function nextTodoIndex(list: WorkoutItem[], doneIds: Set<number>): number {
  const idx = list.findIndex((it) => !doneIds.has(it.id));
  return idx === -1 ? 0 : idx;
}