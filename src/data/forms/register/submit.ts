import type { FieldErrors } from 'react-hook-form';
import saveValues from './saveValues';
import type { RegistrationForm } from './validation';
import { toastError, toastSuccess } from '~/data/helpers/toast';

type Deps = {
  navigation: any;                // @react-navigation
  t: any;                         // i18n slice (e.g., useTranslation().register)
  language?: string;              // defaults to 'en'
  onSuccessNavigateTo?: string;   // defaults to 'Measurements'
};

export function buildSubmit({ navigation, t, language = 'en', onSuccessNavigateTo = 'Measurements' }: Deps) {
  return async (values: RegistrationForm) => {
    try {
      await saveValues(values, { language });
      toastSuccess(t?.success?.welcome ?? 'Welcome to Indigo!');
      navigation.navigate(onSuccessNavigateTo);
    } catch (e: any) {
      // map duplicate/invalid cases
      const msg = String(e?.message ?? e);
      if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
        toastError(t?.errors?.wrongPassword ?? 'This email is already registered. Please sign in with your password.');
      } else {
        toastError(t?.errors?.registerFailed ?? 'Registration failed', msg);
      }
    }
  };
}

export function handleInvalid(t: any) {
  return (errors: FieldErrors<RegistrationForm>) => {
    const first = Object.values(errors)[0];
    if (first?.message) toastError(String(first.message));
  };
}
