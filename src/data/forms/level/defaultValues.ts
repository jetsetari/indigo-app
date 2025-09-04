// src/data/forms/level/defaultValues.ts
import type { LevelFormInput } from './validation';

const defaults: LevelFormInput = {
  training_days: [],
  experience_slugs: [],
  training_history: '',
  training_hours: undefined,
  notes: '',
  competitive: false,
};

export default defaults;
