import type { MetricsForm } from './validation';

const defaultValues: MetricsForm = {
  metric_system: 'kg/cm',
  weight: 70,
  weight_goal: 70,
  height: 170,
  fat_percentage: null,
  measured_by: 'Manual',
  image_front: null,
  image_side: null,
  image_back: null,
};
export default defaultValues;