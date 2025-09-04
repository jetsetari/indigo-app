import { toastSuccess, toastError } from '~/data/helpers/toast';
import { mapEatingHabitsToDB } from './saveValues';
import type { EatingHabitsOutput } from './validation';
import { upsertClientNutritionPatch } from '~/data/supabase/clientsHandler';

export function buildSubmit({ client_id, onDone }: { client_id: number; onDone: () => void }) {
  return async (values: EatingHabitsOutput) => {
    try {
      const patch = mapEatingHabitsToDB(values);
      await upsertClientNutritionPatch({ client_id, patch });
      toastSuccess('Saved', 'Your eating habits have been saved.');
      onDone();
    } catch (e: any) {
      toastError('Save failed', e?.message ?? 'Please try again.');
    }
  };
}

export const handleInvalid = () =>
  toastError('Check your inputs', 'Please review the highlighted fields.');
