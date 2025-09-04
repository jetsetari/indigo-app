import { z } from 'zod';

export const supplementsSchema = z.object({
  supplement_slugs: z.array(z.string()).default([]),
});

export type SupplementsInput  = z.input<typeof supplementsSchema>;
export type SupplementsOutput = z.output<typeof supplementsSchema>;
