import type { WorkoutItem } from '~/data/types';

export type RunRouteParams = {
  StartWorkout: { items: WorkoutItem[]; supersetNum: number; };
  Exercise: { item: WorkoutItem; setIndex: number; supersetNum: number; };
  LogExercise: { item: WorkoutItem; setIndex: number; supersetNum: number; };
};