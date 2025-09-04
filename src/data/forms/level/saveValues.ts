import type { LevelFormOutput } from './validation';

export type LevelDBPatch = {
  // client_goals table columns you want to touch in this step
  training_days?: string[];        // _text
  training_history?: string|null;  // text (slug)
  training_hours?: number|null;    // numeric
  notes?: string|null;             // text
};

export function mapLevelFormToDB(input: LevelFormOutput): {
  goalsPatch: LevelDBPatch;
  experienceSlugs: string[];       // for client_group_experience
} {
  const goalsPatch: LevelDBPatch = {
    training_days: input.training_days ?? [],
    training_history: input.training_history ? String(input.training_history) : null,
    training_hours: typeof input.training_hours === 'number' ? input.training_hours : null,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };
  return {
    goalsPatch,
    experienceSlugs: input.experience_slugs ?? [],
  };
}