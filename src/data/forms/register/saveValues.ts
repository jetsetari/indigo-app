import { registerAndBootstrap } from '~/data/supabase/authHandler';
import type { RegistrationForm } from './validation';

export default async function saveValues(values: RegistrationForm, opts?: { language?: string }) {
  const language = opts?.language ?? 'nl';
  return registerAndBootstrap({
    email: values.email.trim().toLowerCase(),
    password: values.password,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    dob: values.dob,
    language,
    gender: values.gender,
    avatar_url: values.avatar_url ?? null,
  });
}
