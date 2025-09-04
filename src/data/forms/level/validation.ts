// validation.ts
import { z } from 'zod';

export const weekDays = ['MO','TU','WE','TH','FR','SA','SU'] as const;

export const levelSchema = z.object({
  training_days: z.array(z.enum(weekDays)).default([]), // output is defined
  experience_slugs: z.array(z.string()).default([]),
  training_history: z.string().default(''),
  training_hours: z.number().positive().min(0.5).max(6).optional(),
  notes: z.string().max(2000).default(''),
  competitive: z.boolean().default(false),
});

export type LevelFormInput  = z.input<typeof levelSchema>;  // optional fields (what resolver expects)
export type LevelFormOutput = z.output<typeof levelSchema>; // defaults applied (what you might save)
