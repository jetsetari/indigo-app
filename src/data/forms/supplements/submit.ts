import { toastSuccess, toastError } from '~/data/helpers/toast';
import { mapSupplements } from './saveValues';
import type { SupplementsOutput } from './validation';
import { setClientSupplements } from '~/data/supabase/clientsHandler';

export function buildSubmit({ client_id, onDone }: { client_id: number; onDone: () => void }) {
  return async (values: SupplementsOutput) => {
    try {
      const slugs = mapSupplements(values);
      await setClientSupplements(client_id, slugs); // replace rows
      toastSuccess('Saved', 'Your supplements have been saved.');
      onDone();
    } catch (e: any) {
      toastError('Save failed', e?.message ?? 'Please try again.');
    }
  };
}

export const handleInvalid = () =>
  toastError('Check your inputs', 'Please review the highlighted fields.');
