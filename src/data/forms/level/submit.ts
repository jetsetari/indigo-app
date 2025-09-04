import { toastError, toastSuccess } from '~/data/helpers/toast';
import { mapLevelFormToDB } from './saveValues';
import { levelSchema, type LevelFormInput } from './validation';

import { upsertClientGoalsPatch, setClientGroupExperience } from '~/data/supabase/clientsHandler';

export function buildSubmit({ client_id, onDone }: { client_id: number; onDone: () => void }) {
  return async (values: LevelFormInput) => {
    try {
      const parsed = levelSchema.parse(values);
      const { goalsPatch, experienceSlugs } = mapLevelFormToDB(parsed);

      // upsert/patch client_goals
      await upsertClientGoalsPatch({ client_id, patch: goalsPatch });

      // replace experiences (many-to-one)
      await setClientGroupExperience(client_id, experienceSlugs);

      toastSuccess('Saved', 'Your level details have been saved.');
      onDone();
    } catch (e: any) {
      toastError('Save failed', e?.message ?? 'Please try again.');
    }
  };
}

export function handleInvalid() {
  return () => toastError('Check your inputs', 'Please review the highlighted fields.');
}
