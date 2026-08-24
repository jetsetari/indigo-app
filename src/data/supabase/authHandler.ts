import { supabase } from './connection';
import { useUserStore } from '../store/userStore';
import useTranslation from '~/data/helpers/translation';
import { prepareClientRow, fetchClientByEmail } from '~/data/supabase/clientsHandler';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { snakeToCamel } from '../helpers';

const t = useTranslation().login;

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    toastError(t.toastFailTitle, error.message ?? t.toastFailBodyFallback);
    throw error;
  }
  const client = await fetchClientByEmail(email).catch(() => null);
  const store = useUserStore.getState();
  store.setAuth?.({ user: data.user, session: data.session });
  if (client) store.setClient?.(client);
  toastSuccess(t.toastSuccessTitle, t.toastSuccessBody);
  return data;
}

export async function logout(navigation: any) {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('logout failed', e);
  } finally {
    useUserStore.getState().reset?.();
    useUserStore.getState().setClient?.(null);
    navigation.reset({ index: 0, routes: [{ name: 'Start' }] });
  }
}

/** Permanently delete the signed-in user's account + related data, then sign out. */
export async function deleteAccount(navigation: any) {
  const { error } = await supabase.rpc('delete_own_account');
  if (error) {
    toastError('Delete failed', error.message || 'Could not delete your account.');
    throw error;
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // Auth user may already be gone after the RPC.
  }

  useUserStore.getState().reset?.();
  useUserStore.getState().setClient?.(null);
  toastSuccess('Account deleted', 'Your account has been permanently deleted.');
  navigation.reset({ index: 0, routes: [{ name: 'Start' }] });
}

export async function createAndLoginClient(form: any) {
  const { email, password } = form ?? {};
  if (!email || !password) throw new Error('email and password are required');

  let user = null, session = null;
  const signUp = await supabase.auth.signUp({ email, password });
  const accountAlreadyExists =
    !signUp.error &&
    Array.isArray(signUp.data.user?.identities) &&
    signUp.data.user.identities.length === 0;

  if (signUp.error || accountAlreadyExists) {
    const signInRes = await supabase.auth.signInWithPassword({ email, password });
    if (signInRes.error) throw signInRes.error;
    user = signInRes.data.user;
    session = signInRes.data.session;
  } else {
    user = signUp.data.user;
    session = signUp.data.session;
  }

  if (!user || !session) {
    throw new Error('Please confirm your email, then sign in to continue.');
  }

  const row = prepareClientRow(form);
  // clients has no user_id column — match by email only

  const { data: existing, error: selErr } = await supabase
    .from('clients').select('id').eq('email', email).maybeSingle();
  if (selErr) throw selErr;

  if (existing?.id) {
    const { error: updErr } = await supabase.from('clients').update(row).eq('id', existing.id);
    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await supabase.from('clients').insert(row);
    if (insErr) throw insErr;
  }

  // 3) fetch fresh client & hydrate store
  const client = await fetchClientByEmail(email);
  const store = useUserStore.getState();
  store.setAuth?.({ user, session });
  store.setClient?.(client);

  toastSuccess(t.toastSuccessTitle, t.toastSuccessBody);
  return { user, session, client };
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'indigo://reset-password',
  });
  if (error) {
    toastError('Reset Failed', error.message ?? 'Failed to send password reset email');
    throw error;
  }
  toastSuccess('Reset Email Sent', 'Please check your email for password reset instructions');
}


// EatingHabits + Supplements temporarily removed from onboarding
export const INTAKE_KEYS = ['metrics','goals','level'] as const;
export type IntakeKey = typeof INTAKE_KEYS[number];

// explicit map → your screen component/route names
const ROUTE_MAP: Record<IntakeKey, string> = {
  metrics: 'Metrics',
  goals: 'Goals',
  level: 'Level',
  // eatinghabbits: 'EatingHabits', // note spelling vs DB key
  // supplements: 'Supplements',
};

export function nextIntakeRoute(done: string[] = []): string {
  const next = INTAKE_KEYS.find(k => !done.includes(k));
  return next ? ROUTE_MAP[next] : 'Home';
}

// signIn helper now returns route name (Caps)
export async function signInAndGetNext(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const isNetwork =
      /network request failed/i.test(error.message ?? '') ||
      error.name === 'AuthRetryableFetchError';
    toastError(
      t.toastFailTitle,
      isNetwork
        ? 'Network error. Check your connection and try again.'
        : (error.message || t.toastFailBodyFallback),
    );
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { next: 'Start' as const };
  const userEmail = user?.email ?? email;

  const { data: clientRow, error: selErr } = await supabase
  .from('clients')
  .select(`
    id, email, first_name, last_name,
    avatar_url,
    done_screens,
    metric_system, desired_weight,
    created_at
  `)
  .eq('email', userEmail)
  .maybeSingle();

  if (!selErr && clientRow) {
    const clientCamel = snakeToCamel(clientRow);   // avatar_url -> avatarUrl, done_screens -> doneScreens, ...
    useUserStore.getState().setClient?.(clientCamel);
    
    // Get next route based on done screens
    const next = nextIntakeRoute(clientRow.done_screens ?? []);
    return { next };
  }

  // If no client found, default to Metrics (first intake screen)
  return { next: 'Metrics' };
}
