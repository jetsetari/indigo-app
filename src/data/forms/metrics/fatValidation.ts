import { z } from 'zod';
export const fatSchema = z.object({
  fat_percentage: z.number().min(1).max(100),
});
export type FatForm = z.infer<typeof fatSchema>;
