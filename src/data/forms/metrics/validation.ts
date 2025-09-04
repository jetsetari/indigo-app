import { z } from 'zod';

export const metricsSchema = z.object({
  metric_system : z.enum(['kg/cm', 'lbs/inches']),
  weight        : z.number().min(1, 'Enter your weight'),
  weight_goal   : z.number().min(1, 'Enter your goal weight'),
  height        : z.number().min(1, 'Enter your height'),
  fat_percentage: z.number().min(1, 'Min 1%').max(100, 'Max 100%').nullable(),
  measured_by   : z.enum(['Manual', 'AI']),
  image_front   : z.string().url().nullable().optional(),
  image_side    : z.string().url().nullable().optional(),
  image_back    : z.string().url().nullable().optional(),
});

export type MetricsForm = z.infer<typeof metricsSchema>;
