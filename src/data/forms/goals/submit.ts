import { toastError, toastSuccess } from '~/data/helpers/toast';
import saveValues from './saveValues';

type BuildSubmitOpts = {
  navigation: any;
  t: any;
  onSuccessNavigateTo?: string; // next stop
};

export function buildSubmit({ navigation, t, onSuccessNavigateTo = 'Level' }: BuildSubmitOpts) {
  return async (values: any) => {
    try {
      await saveValues(values);
      toastSuccess('Saved', 'Your goals have been saved successfully.');
      navigation.navigate(onSuccessNavigateTo);
    } catch (e: any) {
      toastError('Could not save your goals', e?.message ?? String(e));
    }
  };
}

export function handleInvalid(_t: any) {
  return (errors: Record<string, any>) => {
    const first = Object.values(errors)[0];
    if (first?.message) toastError(String(first.message));
  };
}
