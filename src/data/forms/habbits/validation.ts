import { z } from 'zod';

export const eatingHabitsSchema = z.object({
  interested_in_nutrition: z.boolean().default(true),
  eating_habits: z.string().min(1, 'Please choose a style').default('balanced'), // slug from eatingOptions
  meals_per_day: z.number().int().positive().min(1).max(12).default(2),
  daily_kcal_intake: z.number().int().positive().optional(), // can be left blank
});

export type EatingHabitsInput  = z.input<typeof eatingHabitsSchema>;
export type EatingHabitsOutput = z.output<typeof eatingHabitsSchema>;
