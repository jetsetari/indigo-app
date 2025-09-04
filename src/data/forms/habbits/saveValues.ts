import type { EatingHabitsOutput } from './validation';

export type NutritionPatch = {
  interested_in_nutrition?: boolean;
  eating_habits?: string | null;
  meals_per_day?: number | null;
  daily_kcal_intake?: number | null;
};

export function mapEatingHabitsToDB(values: EatingHabitsOutput): NutritionPatch {
  return {
    interested_in_nutrition: !!values.interested_in_nutrition,
    eating_habits: values.eating_habits || null,
    meals_per_day: typeof values.meals_per_day === 'number' ? values.meals_per_day : null,
    daily_kcal_intake: typeof values.daily_kcal_intake === 'number' ? values.daily_kcal_intake : null,
  };
}
