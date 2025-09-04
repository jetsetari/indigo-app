import type { EatingHabitsInput } from './validation';

const defaults: EatingHabitsInput = {
  interested_in_nutrition: true,
  eating_habits: 'balanced',
  meals_per_day: 2,
  daily_kcal_intake: undefined,
};

export default defaults;
