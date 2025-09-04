// helpers/homeMap.ts
import type { WorkoutItem } from '~/data/supabase/workoutsHandler';
import type { ImageSourcePropType } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
  slug: string;
  image?: ImageSourcePropType;
  screen: string;
};

export function mapItemsToOptions(items: WorkoutItem[]): SelectOption[] {
  return items.map((it) => {
    const ex = it.exercise;
    const left = it.superset_label ? `${it.superset_label} · ` : '';
    const right = ex?.name ?? 'Exercise';
    return {
      label: `${left}${right}`,           // e.g. "A1 · Bench Press"
      value: String(it.id),
      slug: `ex-${it.id}`,
      image: ex?.cover ? { uri: ex.cover } : undefined,
      screen: 'Workouts'
    };
  });
}