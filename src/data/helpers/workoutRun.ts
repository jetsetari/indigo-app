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

export type WorkoutExecutionStep = {
  item: WorkoutItem;
  setIndex: number;
  supersetNum: number;
};

/**
 * Build the workout in execution order:
 * group 1 set 1 (1A, 1B...), group 1 set 2, then group 2, etc.
 */
export function buildWorkoutExecution(items: WorkoutItem[]): WorkoutExecutionStep[] {
  const groups = groupBySupersetNumber(items);
  const keys = Array.from(groups.keys()).sort((a, b) => a - b);
  const steps: WorkoutExecutionStep[] = [];

  for (const supersetNum of keys) {
    const group = groups.get(supersetNum) ?? [];
    const totalSets = setsCountForGroup(group);
    for (let setIndex = 0; setIndex < totalSets; setIndex++) {
      for (const item of group) {
        steps.push({ item, setIndex, supersetNum });
      }
    }
  }

  return steps;
}

export function setsCountForItem(items: WorkoutItem[], itemId: number): number {
  for (const group of groupBySupersetNumber(items).values()) {
    if (group.some((item) => item.id === itemId)) return setsCountForGroup(group);
  }
  return 1;
}

/** A step is done when this item already has more logged sets than setIndex (0-based). */
export function isStepComplete(
  step: WorkoutExecutionStep,
  logsCountByItem: Map<number, number>
): boolean {
  const logged = logsCountByItem.get(step.item.id) ?? 0;
  return logged > step.setIndex;
}

/**
 * Next incomplete step in supersets execution order.
 * If `afterStep` is set, search starts after that step (used after Log & Continue).
 * Returns null when nothing incomplete remains.
 */
export function findNextIncompleteStep(
  items: WorkoutItem[],
  logsCountByItem: Map<number, number>,
  afterStep?: { itemId: number; setIndex: number } | null
): WorkoutExecutionStep | null {
  const execution = buildWorkoutExecution(items);
  if (!execution.length) return null;

  let startIndex = 0;
  if (afterStep) {
    const i = execution.findIndex(
      (s) => s.item.id === afterStep.itemId && s.setIndex === afterStep.setIndex
    );
    startIndex = i >= 0 ? i + 1 : 0;
  }

  for (let i = startIndex; i < execution.length; i++) {
    const step = execution[i];
    if (!isStepComplete(step, logsCountByItem)) return step;
  }

  return null;
}

// Parse reps string like "10,8,6" or "300s,300s" → array
export function parseReps(reps?: string | null): string[] {
  if (!reps) return [];
  return reps.split(',').map(s => s.trim()).filter(Boolean);
}

// Get the target reps for a given set index (0-based) from one item
export function repsForSet(item: WorkoutItem, setIdx: number): string | undefined {
  const arr = parseReps(item.reps ?? '');
  // One token applies to every set. For legacy short lists, repeat the last target.
  return arr[setIdx] ?? arr[arr.length - 1];
}

// Find the next todo index in a list (doneIds is a Set of workout_item_id)
export function nextTodoIndex(list: WorkoutItem[], doneIds: Set<number>): number {
  const idx = list.findIndex((it) => !doneIds.has(it.id));
  return idx === -1 ? 0 : idx;
}