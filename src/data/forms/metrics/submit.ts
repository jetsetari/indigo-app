// src/data/forms/metrics/submit.ts
import { toastError, toastSuccess } from '~/data/helpers/toast';
import saveValues from './saveValues';

export function buildSubmit({ navigation, t, onSuccessNavigateTo = 'Goals' }: any) {
  return async (values: any) => {
    try {
      console.log(values);
      await saveValues(values);
      toastSuccess('Saved', 'Your measurements have been updated.');
      navigation.navigate(onSuccessNavigateTo); // ← to Goals
    } catch (e: any) {
      toastError(t.metrics.errors.saveFailed, e?.message ?? String(e));
    }
  };
}

export function handleInvalid(t: any) {
  return (errors: Record<string, any>) => {
    const first = Object.values(errors)[0];
    if (first?.message) toastError(String(first.message));
  };
}