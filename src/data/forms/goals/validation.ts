import { z } from 'zod';

export const goalsSchema = z.object({
  weightGoals: z.array(z.string()).default([]),
  performanceGoals: z.array(z.string()).default([]),
  sportGoals: z.array(z.string()).default([]),
});

export type GoalsForm = z.infer<typeof goalsSchema>;