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
    useUserStore.getState().setClient?.(null);
    navigation.reset({ index: 0, routes: [{ name: 'Start' }] });
  }
}

export async function createAndLoginClient(form: any) {
  const { email, password } = form ?? {};
  if (!email || !password) throw new Error('email and password are required');

  let user = null, session = null;
  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.error) {
    const signInRes = await supabase.auth.signInWithPassword({ email, password });
    if (signInRes.error) throw signInRes.error;
    user = signInRes.data.user;
    session = signInRes.data.session;
  } else {
    user = signUp.data.user;
    session = signUp.data.session;
  }

  const row = prepareClientRow(form);
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


export const INTAKE_KEYS = ['metrics','goals','level','eatinghabbits','supplements'] as const;
export type IntakeKey = typeof INTAKE_KEYS[number];

// explicit map → your screen component/route names
const ROUTE_MAP: Record<IntakeKey, string> = {
  metrics: 'Metrics',
  goals: 'Goals',
  level: 'Level',
  eatinghabbits: 'EatingHabits', // note spelling vs DB key
  supplements: 'Supplements',
};

export function nextIntakeRoute(done: string[] = []): string {
  const next = INTAKE_KEYS.find(k => !done.includes(k));
  return next ? ROUTE_MAP[next] : 'Home';
}

// signIn helper now returns route name (Caps)
export async function signInAndGetNext(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { next: 'Start' as const };
  const userEmail = user?.email ?? email;

  const { data: clientRow, error: selErr } = await supabase
  .from('clients')
  .select(`
    id, email, first_name, last_name,
    avatar_url,
    done_screens,
    metric_system, desired_weight
  `)
  .eq('email', userEmail)
  .single();


if (!selErr && clientRow) {
  const clientCamel = snakeToCamel(clientRow);   // avatar_url -> avatarUrl, done_screens -> doneScreens, ...
  useUserStore.getState().setClient?.(clientCamel);
}

// keep your existing next-screen logic as-is…
const { data: clientForNext } = await supabase
  .from('clients')
  .select('done_screens')
  .eq('email', userEmail)
  .single();

const next = nextIntakeRoute(clientForNext?.done_screens ?? []);
return { next };
}
